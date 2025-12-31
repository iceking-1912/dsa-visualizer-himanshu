/**
 * Canvas module exports
 */

export { CanvasEngine, getCanvasEngine, resetCanvasEngine } from './CanvasEngine';
export type { CanvasConfig } from './CanvasEngine';

export { AnimationManager, EasingFunction, getAnimationManager, resetAnimationManager } from './AnimationManager';
export type { Animation } from './AnimationManager';

export { VisualizationLayer, ArrayVisualization, TreeVisualization, GraphVisualization } from './VisualizationLayer';
export type { VisualizationConfig, BarData } from './VisualizationLayer';

export { AlgorithmEngine, getAlgorithmEngine, resetAlgorithmEngine } from './AlgorithmEngine';
export type {
  AlgorithmState,
  ExecutionConfig,
  ExecutionResult,
  VisualizationStep,
  SortingAlgorithm,
  SortingCallbacks,
} from './AlgorithmEngine';

export { PerformanceMonitor, getPerformanceMonitor, resetPerformanceMonitor } from './PerformanceMonitor';
export type { PerformanceMetrics } from './PerformanceMonitor';

export {
  VisualizationColors,
  animationSpeed,
  getDelayForSpeed,
  hexToNumber,
  numberToHex,
  lerpColor,
  generateColorGradient,
} from './visualization-theme';

export {
  DataGenerator,
  dataGenerator,
  randomArray,
  nearlySorted,
  reverseSorted,
  sortedArray,
  duplicates,
  pattern,
  generateForVisualization,
  parseArrayInput,
  validateArray,
} from './DataGenerator';

export {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  shellSort,
  sortingAlgorithms,
  getSortingAlgorithm,
  getSortingAlgorithmNames,
  isSortingAlgorithm,
} from './algorithms/sorting';
export type { SortingAlgorithmName } from './algorithms/sorting';

export {
  CanvasCommandExecutor,
  getCanvasCommandExecutor,
  resetCanvasCommandExecutor,
} from './CanvasCommandExecutor';
export type { RunOptions, CommandExecutorState } from './CanvasCommandExecutor';
