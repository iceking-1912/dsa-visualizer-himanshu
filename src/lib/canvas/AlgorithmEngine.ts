/**
 * AlgorithmEngine - Manages algorithm execution and visualization
 */

import type { ArrayVisualization } from './VisualizationLayer';
import type { AnimationManager } from './AnimationManager';
import { PerformanceMonitor } from './PerformanceMonitor';
import { getDelayForSpeed, VisualizationColors } from './visualization-theme';
import { sleep } from '@/lib/utils';

export interface AlgorithmState {
  isRunning: boolean;
  isPaused: boolean;
  isStopped: boolean;
  array: number[];
  comparisons: number;
  swaps: number;
  accesses: number;
  timeElapsed: number;
  currentStep: number;
  totalSteps: number;
  algorithmName: string;
  progress: number;
}

export interface ExecutionConfig {
  speed: number;
  animationMode: 'step' | 'continuous';
  inputArray: number[];
  inputSize?: number;
  onStep?: (state: AlgorithmState) => void;
  onComplete?: (result: ExecutionResult) => void;
}

export interface ExecutionResult {
  success: boolean;
  finalArray: number[];
  totalComparisons: number;
  totalSwaps: number;
  totalAccesses: number;
  totalTime: number;
  algorithmName: string;
  error?: string;
}

export interface VisualizationStep {
  type: 'compare' | 'swap' | 'set' | 'sorted' | 'pivot' | 'highlight' | 'complete';
  indices: number[];
  values?: number[];
  message?: string;
}

export type SortingAlgorithm = (
  arr: number[],
  callbacks: SortingCallbacks
) => AsyncGenerator<VisualizationStep, void, unknown>;

export interface SortingCallbacks {
  compare: (i: number, j: number) => Promise<boolean>;
  swap: (i: number, j: number) => Promise<void>;
  set: (i: number, value: number) => Promise<void>;
  highlight: (indices: number[], state: string) => Promise<void>;
  markSorted: (indices: number[]) => Promise<void>;
  shouldStop: () => boolean;
  getDelay: () => number;
}

export class AlgorithmEngine {
  private state: AlgorithmState;
  private visualization: ArrayVisualization | null = null;
  private animationManager: AnimationManager | null = null;
  private performanceMonitor: PerformanceMonitor;
  private speed: number = 5;
  private animationMode: 'step' | 'continuous' = 'continuous';
  private stepResolve: (() => void) | null = null;
  private currentGenerator: AsyncGenerator<VisualizationStep, void, unknown> | null = null;

  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.state = this.createInitialState();
  }

  private createInitialState(): AlgorithmState {
    return {
      isRunning: false,
      isPaused: false,
      isStopped: false,
      array: [],
      comparisons: 0,
      swaps: 0,
      accesses: 0,
      timeElapsed: 0,
      currentStep: 0,
      totalSteps: 0,
      algorithmName: '',
      progress: 0,
    };
  }

  /**
   * Set visualization layer
   */
  setVisualization(visualization: ArrayVisualization): void {
    this.visualization = visualization;
  }

  /**
   * Set animation manager
   */
  setAnimationManager(manager: AnimationManager): void {
    this.animationManager = manager;
  }

  /**
   * Set animation speed (1-10)
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(1, Math.min(10, speed));
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Set animation mode
   */
  setAnimationMode(mode: 'step' | 'continuous'): void {
    this.animationMode = mode;
  }

  /**
   * Get delay based on current speed
   */
  private getDelay(): number {
    return getDelayForSpeed(this.speed);
  }

  /**
   * Create sorting callbacks
   */
  private createCallbacks(): SortingCallbacks {
    return {
      compare: async (i: number, j: number): Promise<boolean> => {
        if (this.state.isStopped) throw new Error('Algorithm stopped');
        await this.waitIfPaused();

        this.performanceMonitor.recordComparison();
        this.state.comparisons++;
        this.state.currentStep++;

        try {
          if (this.visualization) {
            this.visualization.setBarState(i, 'comparing');
            this.visualization.setBarState(j, 'comparing');
          }
        } catch {
          // Ignore visualization errors (e.g., WebGL context lost)
        }

        await sleep(this.getDelay());

        if (this.animationMode === 'step') {
          await this.waitForStep();
        }

        // Reset colors
        try {
          if (this.visualization) {
            this.visualization.setBarState(i, 'default');
            this.visualization.setBarState(j, 'default');
          }
        } catch {
          // Ignore visualization errors
        }

        return this.state.array[i] > this.state.array[j];
      },

      swap: async (i: number, j: number): Promise<void> => {
        if (this.state.isStopped) throw new Error('Algorithm stopped');
        await this.waitIfPaused();

        this.performanceMonitor.recordSwap();
        this.state.swaps++;
        this.state.currentStep++;

        // Swap in state array
        [this.state.array[i], this.state.array[j]] = [this.state.array[j], this.state.array[i]];

        try {
          if (this.visualization) {
            this.visualization.setBarState(i, 'swapping');
            this.visualization.setBarState(j, 'swapping');
            this.visualization.swapBars(i, j);
          }
        } catch {
          // Ignore visualization errors (e.g., WebGL context lost)
        }

        await sleep(this.getDelay());

        try {
          if (this.visualization) {
            this.visualization.setBarState(i, 'default');
            this.visualization.setBarState(j, 'default');
          }
        } catch {
          // Ignore visualization errors
        }
      },

      set: async (i: number, value: number): Promise<void> => {
        if (this.state.isStopped) throw new Error('Algorithm stopped');
        await this.waitIfPaused();

        this.performanceMonitor.recordAccess(2);
        this.state.accesses += 2;
        this.state.array[i] = value;

        try {
          if (this.visualization) {
            const data = this.visualization.getData();
            data[i] = value;
            this.visualization.update(data);
          }
        } catch {
          // Ignore visualization errors (e.g., WebGL context lost)
        }

        await sleep(this.getDelay() / 2);
      },

      highlight: async (indices: number[], state: string): Promise<void> => {
        if (this.state.isStopped) return;

        try {
          if (this.visualization) {
            for (const idx of indices) {
              this.visualization.setBarState(idx, state as 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'min' | 'max');
            }
          }
        } catch {
          // Ignore visualization errors (e.g., WebGL context lost)
        }
      },

      markSorted: async (indices: number[]): Promise<void> => {
        if (this.state.isStopped) return;

        try {
          if (this.visualization) {
            for (const idx of indices) {
              this.visualization.setBarState(idx, 'sorted');
            }
          }
        } catch {
          // Ignore visualization errors (e.g., WebGL context lost)
        }

        await sleep(this.getDelay() / 4);
      },

      shouldStop: (): boolean => {
        return this.state.isStopped;
      },

      getDelay: (): number => {
        return this.getDelay();
      },
    };
  }

  /**
   * Wait while paused
   */
  private async waitIfPaused(): Promise<void> {
    while (this.state.isPaused && !this.state.isStopped) {
      await sleep(100);
    }
  }

  /**
   * Wait for step command in step mode
   */
  private waitForStep(): Promise<void> {
    return new Promise((resolve) => {
      this.stepResolve = resolve;
    });
  }

  /**
   * Execute an algorithm
   */
  async execute(
    algorithmName: string,
    algorithm: SortingAlgorithm,
    config: ExecutionConfig
  ): Promise<ExecutionResult> {
    // Reset state
    this.state = {
      ...this.createInitialState(),
      array: [...config.inputArray],
      algorithmName,
      isRunning: true,
    };

    this.speed = config.speed;
    this.animationMode = config.animationMode;

    // Initialize visualization
    try {
      if (this.visualization) {
        this.visualization.setData([...config.inputArray]);
      }
    } catch {
      // Ignore visualization errors (e.g., WebGL context lost)
    }

    // Start performance monitoring
    this.performanceMonitor.start();

    const callbacks = this.createCallbacks();

    try {
      // Run the algorithm
      this.currentGenerator = algorithm(this.state.array, callbacks);

      for await (const step of this.currentGenerator) {
        if (this.state.isStopped) break;

        // Call step callback if provided
        if (config.onStep) {
          this.state.timeElapsed = this.performanceMonitor.getTimeElapsed();
          config.onStep({ ...this.state });
        }
      }

      // Mark all as sorted if completed successfully
      if (!this.state.isStopped && this.visualization) {
        try {
          for (let i = 0; i < this.state.array.length; i++) {
            this.visualization.setBarState(i, 'sorted');
            await sleep(Math.max(5, this.getDelay() / 10));
          }
        } catch {
          // Ignore visualization errors (e.g., WebGL context lost)
        }
      }
    } catch (error) {
      if ((error as Error).message !== 'Algorithm stopped') {
        console.error('Algorithm execution error:', error);
      }
    }

    // Stop monitoring
    this.performanceMonitor.stop();

    // Create result
    const result: ExecutionResult = {
      success: !this.state.isStopped,
      finalArray: [...this.state.array],
      totalComparisons: this.state.comparisons,
      totalSwaps: this.state.swaps,
      totalAccesses: this.performanceMonitor.getAccesses(),
      totalTime: this.performanceMonitor.getTimeElapsed(),
      algorithmName,
    };

    this.state.isRunning = false;
    this.currentGenerator = null;

    // Call complete callback
    if (config.onComplete) {
      config.onComplete(result);
    }

    return result;
  }

  /**
   * Pause execution
   */
  pause(): void {
    this.state.isPaused = true;
  }

  /**
   * Resume execution
   */
  resume(): void {
    this.state.isPaused = false;
  }

  /**
   * Stop execution
   */
  stop(): void {
    this.state.isStopped = true;
    this.state.isRunning = false;
    this.state.isPaused = false;

    // Resolve any pending step
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  /**
   * Execute one step (in step mode)
   */
  step(): void {
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  /**
   * Get current state
   */
  getState(): AlgorithmState {
    return {
      ...this.state,
      timeElapsed: this.performanceMonitor.getTimeElapsed(),
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return this.performanceMonitor.getMetrics();
  }

  /**
   * Check if running
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.state.isPaused;
  }

  /**
   * Reset engine
   */
  reset(): void {
    this.stop();
    this.state = this.createInitialState();
    this.performanceMonitor.reset();
    if (this.visualization) {
      this.visualization.reset();
    }
  }
}

// Singleton instance
let algorithmEngineInstance: AlgorithmEngine | null = null;

export function getAlgorithmEngine(): AlgorithmEngine {
  if (!algorithmEngineInstance) {
    algorithmEngineInstance = new AlgorithmEngine();
  }
  return algorithmEngineInstance;
}

export function resetAlgorithmEngine(): void {
  if (algorithmEngineInstance) {
    algorithmEngineInstance.reset();
    algorithmEngineInstance = null;
  }
}
