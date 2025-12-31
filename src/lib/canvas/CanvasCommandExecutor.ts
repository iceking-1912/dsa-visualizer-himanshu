/**
 * CanvasCommandExecutor - Bridge between terminal commands and canvas visualization
 */

import { CanvasEngine, getCanvasEngine } from './CanvasEngine';
import { AlgorithmEngine, getAlgorithmEngine, ExecutionResult } from './AlgorithmEngine';
import { ArrayVisualization } from './VisualizationLayer';
import { AnimationManager, getAnimationManager } from './AnimationManager';
import { getSortingAlgorithm, getSortingAlgorithmNames } from './algorithms/sorting';
import { generateForVisualization, parseArrayInput, validateArray } from './DataGenerator';

export interface RunOptions {
  speed?: number;
  mode?: 'step' | 'continuous';
  inputSize?: number;
  inputArray?: number[];
}

export interface CommandExecutorState {
  isRunning: boolean;
  isPaused: boolean;
  currentAlgorithm: string | null;
  progress: number;
}

class CanvasCommandExecutor {
  private canvasEngine: CanvasEngine | null = null;
  private algorithmEngine: AlgorithmEngine | null = null;
  private animationManager: AnimationManager | null = null;
  private visualization: ArrayVisualization | null = null;
  private isInitialized = false;
  private onStateChange: ((state: CommandExecutorState) => void) | null = null;
  private onComplete: ((result: ExecutionResult) => void) | null = null;

  /**
   * Initialize the executor with a canvas container
   */
  async initialize(container: HTMLElement): Promise<void> {
    if (this.isInitialized) {
      console.warn('CanvasCommandExecutor already initialized');
      return;
    }

    // Get or create engine instances
    this.canvasEngine = getCanvasEngine();
    this.algorithmEngine = getAlgorithmEngine();
    this.animationManager = getAnimationManager();

    // Initialize canvas
    await this.canvasEngine.initialize(container);
    this.canvasEngine.setAnimationManager(this.animationManager);

    // Create visualization layer
    this.visualization = new ArrayVisualization(this.canvasEngine, {
      showValues: false,
      showIndices: false,
    });

    // Connect to algorithm engine
    this.algorithmEngine.setVisualization(this.visualization);
    this.algorithmEngine.setAnimationManager(this.animationManager);

    this.isInitialized = true;
  }

  /**
   * Set state change callback
   */
  setOnStateChange(callback: (state: CommandExecutorState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Set completion callback
   */
  setOnComplete(callback: (result: ExecutionResult) => void): void {
    this.onComplete = callback;
  }

  /**
   * Execute the 'run' command
   */
  async executeRun(algorithmName: string, options: RunOptions = {}): Promise<ExecutionResult> {
    if (!this.isInitialized || !this.algorithmEngine) {
      return {
        success: false,
        finalArray: [],
        totalComparisons: 0,
        totalSwaps: 0,
        totalAccesses: 0,
        totalTime: 0,
        algorithmName,
        error: 'CanvasCommandExecutor not initialized',
      };
    }

    // Validate algorithm name
    const algorithm = getSortingAlgorithm(algorithmName);
    if (!algorithm) {
      const available = getSortingAlgorithmNames().join(', ');
      return {
        success: false,
        finalArray: [],
        totalComparisons: 0,
        totalSwaps: 0,
        totalAccesses: 0,
        totalTime: 0,
        algorithmName,
        error: `Unknown algorithm: ${algorithmName}. Available: ${available}`,
      };
    }

    // Stop any running algorithm
    if (this.algorithmEngine.isRunning()) {
      this.algorithmEngine.stop();
    }

    // Generate or use provided array
    let inputArray: number[];
    if (options.inputArray) {
      const validation = validateArray(options.inputArray);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      inputArray = options.inputArray;
    } else {
      const size = options.inputSize || 50;
      inputArray = generateForVisualization(size);
    }

    // Set speed
    const speed = options.speed ?? 5;
    this.algorithmEngine.setSpeed(speed);
    this.algorithmEngine.setAnimationMode(options.mode || 'continuous');

    // Notify state change
    this.notifyStateChange({
      isRunning: true,
      isPaused: false,
      currentAlgorithm: algorithmName,
      progress: 0,
    });

    // Execute algorithm
    const result = await this.algorithmEngine.execute(algorithmName, algorithm, {
      speed,
      animationMode: options.mode || 'continuous',
      inputArray,
      onStep: (state) => {
        this.notifyStateChange({
          isRunning: true,
          isPaused: state.isPaused,
          currentAlgorithm: algorithmName,
          progress: state.progress,
        });
      },
      onComplete: (res) => {
        if (this.onComplete) {
          this.onComplete(res);
        }
      },
    });

    // Notify completion
    this.notifyStateChange({
      isRunning: false,
      isPaused: false,
      currentAlgorithm: null,
      progress: 100,
    });

    return result;
  }

  /**
   * Execute the 'stop' command
   */
  executeStop(): void {
    if (this.algorithmEngine) {
      this.algorithmEngine.stop();
      this.notifyStateChange({
        isRunning: false,
        isPaused: false,
        currentAlgorithm: null,
        progress: 0,
      });
    }
  }

  /**
   * Execute the 'pause' command
   */
  executePause(): void {
    if (this.algorithmEngine && this.algorithmEngine.isRunning()) {
      this.algorithmEngine.pause();
      const state = this.algorithmEngine.getState();
      this.notifyStateChange({
        isRunning: true,
        isPaused: true,
        currentAlgorithm: state.algorithmName,
        progress: state.progress,
      });
    }
  }

  /**
   * Execute the 'resume' command
   */
  executeResume(): void {
    if (this.algorithmEngine && this.algorithmEngine.isPaused()) {
      this.algorithmEngine.resume();
      const state = this.algorithmEngine.getState();
      this.notifyStateChange({
        isRunning: true,
        isPaused: false,
        currentAlgorithm: state.algorithmName,
        progress: state.progress,
      });
    }
  }

  /**
   * Execute the 'step' command
   */
  executeStep(): void {
    if (this.algorithmEngine) {
      this.algorithmEngine.step();
    }
  }

  /**
   * Set animation speed
   */
  setSpeed(speed: number): void {
    if (this.algorithmEngine) {
      this.algorithmEngine.setSpeed(speed);
    }
  }

  /**
   * Get current state
   */
  getState(): CommandExecutorState {
    if (!this.algorithmEngine) {
      return {
        isRunning: false,
        isPaused: false,
        currentAlgorithm: null,
        progress: 0,
      };
    }

    const state = this.algorithmEngine.getState();
    return {
      isRunning: state.isRunning,
      isPaused: state.isPaused,
      currentAlgorithm: state.algorithmName || null,
      progress: state.progress,
    };
  }

  /**
   * Get available algorithms
   */
  getAvailableAlgorithms(): string[] {
    return getSortingAlgorithmNames();
  }

  /**
   * Generate new random array for visualization
   */
  generateArray(size: number): number[] {
    const arr = generateForVisualization(size);
    // Only set data if visualization is ready and canvas engine is initialized
    if (this.visualization && this.canvasEngine?.isReady()) {
      this.visualization.setData(arr);
    }
    return arr;
  }

  /**
   * Set custom array for visualization
   */
  setArray(input: string | number[]): boolean {
    let arr: number[];

    if (typeof input === 'string') {
      const parsed = parseArrayInput(input);
      if (!parsed) return false;
      arr = parsed;
    } else {
      arr = input;
    }

    const validation = validateArray(arr);
    if (!validation.valid) return false;

    // Only set data if visualization is ready and canvas engine is initialized
    if (this.visualization && this.canvasEngine?.isReady()) {
      this.visualization.setData(arr);
    }

    return true;
  }

  /**
   * Reset visualization
   */
  reset(): void {
    if (this.algorithmEngine) {
      this.algorithmEngine.reset();
    }
    if (this.visualization) {
      this.visualization.reset();
    }
    this.notifyStateChange({
      isRunning: false,
      isPaused: false,
      currentAlgorithm: null,
      progress: 0,
    });
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    if (this.algorithmEngine) {
      this.algorithmEngine.stop();
    }
    if (this.visualization) {
      this.visualization.dispose();
    }
    if (this.canvasEngine) {
      this.canvasEngine.dispose();
    }
    this.isInitialized = false;
  }

  private notifyStateChange(state: CommandExecutorState): void {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }
}

// Singleton instance
let executorInstance: CanvasCommandExecutor | null = null;

export function getCanvasCommandExecutor(): CanvasCommandExecutor {
  if (!executorInstance) {
    executorInstance = new CanvasCommandExecutor();
  }
  return executorInstance;
}

export function resetCanvasCommandExecutor(): void {
  if (executorInstance) {
    executorInstance.dispose();
    executorInstance = null;
  }
}

export { CanvasCommandExecutor };
