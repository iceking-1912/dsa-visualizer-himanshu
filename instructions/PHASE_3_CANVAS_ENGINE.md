# DSA Visualizer - Phase 3: Canvas Rendering Engine & Visualization System

## Phase Overview
**Duration**: 3-4 days  
**Objective**: Build complete canvas rendering engine with Pixi.js, implement animation system, and create visualizations for 8+ sorting algorithms  
**Deliverable**: Interactive canvas with smooth animations and visualization controls  
**GitHub Commits**: 2 (canvas engine setup + visualization implementations)

---

do this installation in curerent folder where you want the project to be created that is root of this repo 
## 🎯 Core Objectives

1. Set up Pixi.js canvas renderer with proper scaling
2. Build animation engine with frame-based system
3. Implement visualization layer for data structures
4. Create 8+ sorting algorithm visualizations
5. Build speed/pause/resume control system
6. Implement comparison highlighting and access logging
7. Create algorithm state management
8. Add performance monitoring (comparisons, swaps, time)

---

## 📋 Detailed Requirements

### 1. Canvas Engine Architecture

**CanvasEngine.ts** - Core rendering:

```typescript
// Requirements:
// - Initialize Pixi.js application
// - Handle window resize events
// - Maintain 60 FPS rendering
// - Support multiple rendering modes (2D shapes, bars, nodes)
// - Clear canvas properly
// - Manage layering of visual elements

interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: number; // hex
  targetFPS: number;
  antiAlias: boolean;
  resolution: number;
}

class CanvasEngine {
  private app: PIXI.Application;
  private animationManager: AnimationManager;
  private layers: Map<string, PIXI.Container>;
  
  constructor(container: HTMLElement, config: CanvasConfig);
  
  initialize(): Promise<void>;
  update(deltaTime: number): void;
  clear(): void;
  addLayer(name: string, zIndex: number): PIXI.Container;
  getLayer(name: string): PIXI.Container;
  dispose(): void;
  
  // Rendering primitives
  drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    parent?: PIXI.Container
  ): PIXI.Graphics;
  
  drawCircle(
    x: number,
    y: number,
    radius: number,
    color: number,
    parent?: PIXI.Container
  ): PIXI.Graphics;
  
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number,
    color: number,
    parent?: PIXI.Container
  ): PIXI.Graphics;
  
  drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: number,
    parent?: PIXI.Container
  ): PIXI.Text;
}
```

### 2. Animation System

**AnimationManager.ts** - Manages all animations:

```typescript
// Requirements:
// - Frame-based animation system
// - Support sequential animations
// - Support parallel animations
// - Interpolation (linear, easing)
// - Stop/pause/resume
// - Animation timing

interface Animation {
  target: PIXI.DisplayObject;
  properties: Record<string, number>;
  duration: number;
  easing: EasingFunction;
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

enum EasingFunction {
  Linear = 'linear',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
  ElasticOut = 'elasticOut'
}

class AnimationManager {
  addAnimation(animation: Animation): string; // returns animation id
  removeAnimation(id: string): void;
  pauseAnimation(id: string): void;
  resumeAnimation(id: string): void;
  updateAll(deltaTime: number): void;
  clearAll(): void;
  
  // Sequence animations
  sequence(animations: Animation[], callback?: () => void): void;
  parallel(animations: Animation[], callback?: () => void): void;
}
```

### 3. Visualization Layer

**VisualizationLayer.ts**:

```typescript
// Requirements:
// - Base class for all visualizations
// - Support for different data types (arrays, trees, graphs)
// - Rendering logic for each data type
// - State synchronization with algorithm

abstract class VisualizationLayer {
  protected container: PIXI.Container;
  protected data: any[];
  protected config: VisualizationConfig;
  
  abstract render(): void;
  abstract update(data: any[]): void;
  abstract highlight(indices: number[], color: number): void;
  abstract reset(): void;
  
  // Common methods
  protected getRandomColor(): number;
  protected getColorForValue(value: number, min: number, max: number): number;
  protected scale(value: number, from: [number, number], to: [number, number]): number;
}

// Concrete implementations
class ArrayVisualization extends VisualizationLayer {
  // Renders array as bars/blocks
  // Highlight comparisons
  // Show swaps/movements
}

class TreeVisualization extends VisualizationLayer {
  // Renders tree nodes
  // Shows parent-child relationships
  // Highlight traversals
}

class GraphVisualization extends VisualizationLayer {
  // Renders nodes and edges
  // Shows weights
  // Highlight paths
}
```

### 4. Algorithm Visualization Implementations

**Sorting Algorithm Visualizations** - For each, implement:

```typescript
// Structure for each sorting visualization:
interface SortingVisualization {
  name: string;
  algorithm: (arr: number[]) => AsyncGenerator<VisualizationStep>;
  visualize(arr: number[]): Promise<void>;
}

interface VisualizationStep {
  type: 'compare' | 'swap' | 'state' | 'complete';
  indices?: number[];
  highlightColor?: number;
  delay?: number;
  stats?: {
    comparisons: number;
    swaps: number;
    timeElapsed: number;
  };
}
```

**Sorting Algorithms to Implement (8+)**:

1. **Bubble Sort**
   - Visualize: Two-bar comparison, swap animation
   - Stats: Track comparisons and swaps
   - Highlight: Current comparison in cyan, swapped items in pink

2. **Selection Sort**
   - Visualize: Minimum finding process
   - Highlight: Current min in purple, unsorted in normal

3. **Insertion Sort**
   - Visualize: Insertion process with shifting
   - Highlight: Item being inserted, insertion point

4. **Merge Sort**
   - Visualize: Merge process with sub-arrays
   - Show: Splitting and merging phases
   - Highlight: Subarrays being merged

5. **Quick Sort**
   - Visualize: Partition process with pivot
   - Highlight: Pivot in pink, partition boundaries
   - Show: Recursion depth

6. **Heap Sort**
   - Visualize: Heap structure
   - Show: Heapify process and extraction
   - Highlight: Heap violations and fixes

7. **Counting Sort**
   - Visualize: Count array and placement
   - Show: Distribution phase and output phase

8. **Radix Sort**
   - Visualize: Multiple passes
   - Highlight: Current digit being sorted
   - Show: Bucket distributions

### 5. Algorithm Engine

**AlgorithmEngine.ts** - Manages algorithm execution:

```typescript
// Requirements:
// - Execute algorithms step-by-step
// - Manage pause/resume
// - Track statistics
// - Generate visualization steps
// - Handle speed control

interface AlgorithmState {
  isRunning: boolean;
  isPaused: boolean;
  array: number[];
  comparisons: number;
  swaps: number;
  accesses: number;
  timeElapsed: number;
  currentStep: number;
  totalSteps: number;
}

interface ExecutionConfig {
  speed: number; // 1-10
  animationMode: 'step' | 'continuous';
  inputArray: number[];
  inputSize?: number;
}

class AlgorithmEngine {
  private state: AlgorithmState;
  private visualization: VisualizationLayer;
  private animationManager: AnimationManager;
  
  async execute(
    algorithm: SortingAlgorithm,
    config: ExecutionConfig
  ): Promise<ExecutionResult>;
  
  pause(): void;
  resume(): void;
  stop(): void;
  step(): void;
  
  getState(): AlgorithmState;
  setSpeed(speed: number): void;
  setAnimationMode(mode: 'step' | 'continuous'): void;
  
  // Statistics
  getComparisons(): number;
  getSwaps(): number;
  getAccesses(): number;
  getTimeElapsed(): number;
}

interface ExecutionResult {
  success: boolean;
  finalArray: number[];
  totalComparisons: number;
  totalSwaps: number;
  totalAccesses: number;
  totalTime: number;
  efficiency: {
    timeComplexityPredicted: string;
    actualTime: number;
    predictedTime: number;
  };
}
```

### 6. Color and Styling System for Visualizations

```typescript
// utils/canvas/visualization-theme.ts

enum VisualizationColor {
  Default = 0x5b6d99,      // Neutral blue-gray
  Accent1 = 0x00d9ff,       // Cyan (comparisons)
  Accent2 = 0xff006e,       // Pink (swaps)
  Accent3 = 0x8338ec,       // Purple (pivot)
  Success = 0x00ff00,       // Green (sorted)
  Error = 0xff0040,         // Red (invalid)
  Min = 0x00d9ff,           // Cyan
  Max = 0xff006e,           // Pink
  Visited = 0x8338ec,       // Purple
  Unvisited = 0x606060      // Dark gray
}

const animationSpeed = {
  1: 1000,   // Very slow
  2: 800,
  3: 600,
  4: 400,
  5: 250,    // Normal
  6: 150,
  7: 100,
  8: 50,
  9: 25,
  10: 10     // Very fast
};
```

### 7. Input Generation Utilities

**DataGenerator.ts** - Generate test data:

```typescript
class DataGenerator {
  // Generate arrays for testing
  randomArray(size: number): number[];
  nearlySorted(size: number): number[];
  reverseSorted(size: number): number[];
  almostSorted(size: number): number[];
  duplicates(size: number): number[];
  
  // Visualization modes
  generateForVisualization(size: number, seed?: number): number[];
}
```

### 8. Performance Monitoring

**PerformanceMonitor.ts**:

```typescript
interface PerformanceMetrics {
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
  timeElapsed: number;
  fps: number;
  animationFrameCount: number;
}

class PerformanceMonitor {
  recordComparison(): void;
  recordSwap(): void;
  recordAccess(): void;
  
  getMetrics(): PerformanceMetrics;
  reset(): void;
  
  // FPS monitoring
  measureFPS(deltaTime: number): number;
}
```

### 9. Canvas Integration with Terminal

Create bridge between terminal commands and visualization:

```typescript
// utils/canvas/command-executor.ts

class CanvasCommandExecutor {
  async executeRun(
    algorithmName: string,
    options: {
      speed?: number;
      mode?: 'step' | 'continuous';
      inputSize?: number;
      inputArray?: number[];
    }
  ): Promise<ExecutionResult>;
  
  async executeStop(): Promise<void>;
  async executePause(): Promise<void>;
  async executeResume(): Promise<void>;
  async executeStep(): Promise<VisualizationStep>;
  
  setCanvasEngine(engine: CanvasEngine): void;
  setAlgorithmEngine(engine: AlgorithmEngine): void;
}
```

### 10. Canvas Component Integration

**CanvasRenderer.tsx**:

```typescript
interface CanvasRendererProps {
  algorithmName?: string;
  isRunning: boolean;
  speed: number;
  mode: 'step' | 'continuous';
  onExecutionComplete?: (result: ExecutionResult) => void;
  inputArray?: number[];
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  algorithmName,
  isRunning,
  speed,
  mode,
  onExecutionComplete,
  inputArray
}) => {
  // Initialize engines
  // Handle prop changes
  // Manage lifecycle
  // Render stats overlay
};
```

### 11. Stats Overlay Component

**StatsOverlay.tsx** - Display during visualization:

```
╔════════════════════════════════════════╗
║  Bubble Sort Visualization             ║
╠════════════════════════════════════════╣
║  Array Size: 100                       ║
║  Comparisons: 2,450                    ║
║  Swaps: 1,230                          ║
║  Time Elapsed: 2.34s                   ║
║  FPS: 60                               ║
║  Speed: 5/10                           ║
║                                        ║
║  Status: Running...  [████████░] 75%   ║
╚════════════════════════════════════════╝
```

---

## 🔧 Implementation Checklist

### Canvas Engine:
- [ ] Pixi.js initialization
- [ ] Layer system (data, visualization, overlay)
- [ ] Primitive drawing methods
- [ ] Resize handling
- [ ] FPS management

### Animation System:
- [ ] Animation queueing
- [ ] Easing functions
- [ ] Sequential and parallel execution
- [ ] Pause/resume functionality

### Visualization Layer:
- [ ] Base visualization class
- [ ] Array visualization
- [ ] Color mapping system
- [ ] Highlight system

### Sorting Visualizations (8 algorithms):
- [ ] Bubble Sort with comparisons highlighted
- [ ] Selection Sort with min finding
- [ ] Insertion Sort with insertion animation
- [ ] Merge Sort with merge process
- [ ] Quick Sort with partition visualization
- [ ] Heap Sort with heap structure
- [ ] Counting Sort with distribution
- [ ] Radix Sort with digit-by-digit sorting

### Algorithm Engine:
- [ ] Step-by-step execution
- [ ] Pause/resume/stop controls
- [ ] Statistics tracking
- [ ] Speed control

### Integration:
- [ ] Terminal commands trigger visualizations
- [ ] State synchronization
- [ ] Performance monitoring

---

## ✅ Deliverables (End of Phase 3)

### Code Deliverables:
1. ✅ CanvasEngine with Pixi.js integration
2. ✅ AnimationManager with easing functions
3. ✅ Base VisualizationLayer class
4. ✅ 8+ sorting algorithm visualizations
5. ✅ AlgorithmEngine with execution control
6. ✅ PerformanceMonitor for statistics
7. ✅ CanvasCommandExecutor for CLI integration
8. ✅ StatsOverlay component
9. ✅ DataGenerator utilities
10. ✅ CanvasRenderer component

### Documentation:
1. ✅ CANVAS_ARCHITECTURE.md
2. ✅ VISUALIZATION_GUIDE.md
3. ✅ ALGORITHM_IMPLEMENTATION.md

### GitHub Commits:
- **Commit 1**: "feat: Phase 3 canvas engine - Pixi.js setup and animation system"
- **Commit 2**: "feat: Phase 3 visualizations - 8 sorting algorithms with animations"

### Performance Benchmarks:
```
Target: 60 FPS at all speeds
- Array size up to 5000 elements
- Smooth animations at speed 10
- Memory usage < 100MB
```

---

## 🚀 Success Criteria

- [ ] Canvas renders smoothly at 60 FPS
- [ ] All 8 sorting algorithms visualize correctly
- [ ] Animations are smooth and synchronized
- [ ] Pause/resume works properly
- [ ] Statistics tracking is accurate
- [ ] Terminal commands trigger visualizations
- [ ] Speed control affects animation timing correctly
- [ ] Color highlighting is clear and useful
- [ ] No memory leaks during long animations
- [ ] Performance remains stable

---

## 📝 Notes for LLM

- Focus on smooth animations - this is critical for UX
- Ensure easing functions feel natural
- Test with large arrays (5000+ elements)
- Optimize for 60 FPS target
- Use TypeScript strictly - no `any` types
- Synchronize canvas and terminal state perfectly
- Make visualization colors distinct and accessible

---

**Next Phase**: Phase 4 will implement the File Explorer UI and finalize the design system.

