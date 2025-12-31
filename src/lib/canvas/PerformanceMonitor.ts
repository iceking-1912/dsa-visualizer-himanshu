/**
 * PerformanceMonitor - Tracks algorithm execution statistics
 */

export interface PerformanceMetrics {
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
  timeElapsed: number;
  fps: number;
  animationFrameCount: number;
  startTime: number;
  endTime: number | null;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private fpsHistory: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;

  constructor() {
    this.metrics = this.createInitialMetrics();
  }

  private createInitialMetrics(): PerformanceMetrics {
    return {
      comparisons: 0,
      swaps: 0,
      memoryAccesses: 0,
      timeElapsed: 0,
      fps: 60,
      animationFrameCount: 0,
      startTime: 0,
      endTime: null,
    };
  }

  /**
   * Start monitoring
   */
  start(): void {
    this.metrics = this.createInitialMetrics();
    this.metrics.startTime = performance.now();
    this.lastFrameTime = this.metrics.startTime;
    this.fpsHistory = [];
    this.frameCount = 0;
  }

  /**
   * Stop monitoring and finalize metrics
   */
  stop(): void {
    this.metrics.endTime = performance.now();
    this.metrics.timeElapsed = this.metrics.endTime - this.metrics.startTime;
  }

  /**
   * Record a comparison operation
   */
  recordComparison(): void {
    this.metrics.comparisons++;
    this.metrics.memoryAccesses += 2; // Two array accesses for comparison
  }

  /**
   * Record a swap operation
   */
  recordSwap(): void {
    this.metrics.swaps++;
    this.metrics.memoryAccesses += 4; // Two reads + two writes
  }

  /**
   * Record a memory access
   */
  recordAccess(count = 1): void {
    this.metrics.memoryAccesses += count;
  }

  /**
   * Record multiple comparisons
   */
  recordComparisons(count: number): void {
    this.metrics.comparisons += count;
    this.metrics.memoryAccesses += count * 2;
  }

  /**
   * Record multiple swaps
   */
  recordSwaps(count: number): void {
    this.metrics.swaps += count;
    this.metrics.memoryAccesses += count * 4;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    // Update time elapsed if still running
    if (this.metrics.endTime === null) {
      this.metrics.timeElapsed = performance.now() - this.metrics.startTime;
    }
    return { ...this.metrics };
  }

  /**
   * Get comparison count
   */
  getComparisons(): number {
    return this.metrics.comparisons;
  }

  /**
   * Get swap count
   */
  getSwaps(): number {
    return this.metrics.swaps;
  }

  /**
   * Get memory access count
   */
  getAccesses(): number {
    return this.metrics.memoryAccesses;
  }

  /**
   * Get time elapsed in milliseconds
   */
  getTimeElapsed(): number {
    if (this.metrics.endTime === null) {
      return performance.now() - this.metrics.startTime;
    }
    return this.metrics.timeElapsed;
  }

  /**
   * Get time elapsed formatted
   */
  getTimeElapsedFormatted(): string {
    const ms = this.getTimeElapsed();
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Measure FPS (call each frame)
   */
  measureFPS(deltaTime: number): number {
    this.frameCount++;
    this.metrics.animationFrameCount++;

    const now = performance.now();
    if (now - this.lastFrameTime >= 1000) {
      this.metrics.fps = this.frameCount;
      this.fpsHistory.push(this.frameCount);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    return this.metrics.fps;
  }

  /**
   * Get average FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = this.createInitialMetrics();
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Get formatted statistics string
   */
  getFormattedStats(): string {
    return [
      `Comparisons: ${this.metrics.comparisons.toLocaleString()}`,
      `Swaps: ${this.metrics.swaps.toLocaleString()}`,
      `Memory Accesses: ${this.metrics.memoryAccesses.toLocaleString()}`,
      `Time: ${this.getTimeElapsedFormatted()}`,
      `FPS: ${Math.round(this.metrics.fps)}`,
    ].join('\n');
  }

  /**
   * Get summary object for display
   */
  getSummary(): {
    comparisons: string;
    swaps: string;
    accesses: string;
    time: string;
    fps: string;
  } {
    return {
      comparisons: this.metrics.comparisons.toLocaleString(),
      swaps: this.metrics.swaps.toLocaleString(),
      accesses: this.metrics.memoryAccesses.toLocaleString(),
      time: this.getTimeElapsedFormatted(),
      fps: Math.round(this.metrics.fps).toString(),
    };
  }
}

// Singleton instance
let performanceMonitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

export function resetPerformanceMonitor(): void {
  if (performanceMonitorInstance) {
    performanceMonitorInstance.reset();
  }
}
