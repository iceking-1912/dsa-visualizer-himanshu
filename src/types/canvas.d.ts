// Canvas-specific type definitions

export interface CanvasState {
  width: number;
  height: number;
  isInitialized: boolean;
  currentAnimation: string | null;
  animationFrame: number;
  bars: Bar[];
}

export interface Bar {
  id: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isComparing: boolean;
  isSwapping: boolean;
  isSorted: boolean;
}

export interface AnimationStep {
  type: 'compare' | 'swap' | 'set' | 'highlight' | 'sorted';
  indices: number[];
  values?: number[];
  message?: string;
}

export interface VisualizationConfig {
  arraySize: number;
  compareDelay: number;
  swapDelay: number;
  barGap: number;
  barColor: string;
  compareColor: string;
  swapColor: string;
  sortedColor: string;
}
