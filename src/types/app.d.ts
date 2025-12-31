// Application-wide type definitions

export type Theme = 'moonlight' | 'matrix';
export type AnimationMode = 'step' | 'continuous';
export type AnimationSpeed = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface AppState {
  activeAlgorithm: string;
  arraySize: number;
  animationSpeed: AnimationSpeed;
  theme: Theme;
  isPlaying: boolean;
  isPaused: boolean;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string[];
  children?: TreeNode[];
  metadata?: AlgorithmMetadata;
}

export interface AlgorithmMetadata {
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable?: boolean;
  inPlace?: boolean;
  adaptive?: boolean;
  code?: string;
  categories: string[];
}

export interface AlgorithmData {
  [category: string]: {
    [algorithm: string]: AlgorithmMetadata & { name: string };
  };
}
