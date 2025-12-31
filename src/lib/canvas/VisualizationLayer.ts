/**
 * VisualizationLayer - Base class for all visualizations
 * Provides common functionality for rendering and highlighting
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { CanvasEngine } from './CanvasEngine';
import { VisualizationColors } from './visualization-theme';

export interface VisualizationConfig {
  barGap: number;
  minBarWidth: number;
  maxBarWidth: number;
  padding: number;
  showValues: boolean;
  showIndices: boolean;
}

const defaultConfig: VisualizationConfig = {
  barGap: 2,
  minBarWidth: 2,
  maxBarWidth: 50,
  padding: 20,
  showValues: false,
  showIndices: false,
};

export interface BarData {
  id: number;
  value: number;
  graphics: Graphics | null;
  textGraphics: Text | null;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'min' | 'max';
}

export abstract class VisualizationLayer {
  protected container: Container;
  protected engine: CanvasEngine;
  protected data: number[] = [];
  protected bars: BarData[] = [];
  protected config: VisualizationConfig;

  constructor(engine: CanvasEngine, config: Partial<VisualizationConfig> = {}) {
    this.engine = engine;
    this.config = { ...defaultConfig, ...config };
    this.container = new Container();
    this.container.label = 'visualization-layer';

    const layer = engine.getLayer('visualization');
    if (layer) {
      layer.addChild(this.container);
    }
  }

  /**
   * Render the visualization
   */
  abstract render(): void;

  /**
   * Update the visualization with new data
   */
  abstract update(data: number[]): void;

  /**
   * Highlight specific indices
   */
  abstract highlight(indices: number[], color: number): void;

  /**
   * Reset the visualization
   */
  abstract reset(): void;

  /**
   * Get random color
   */
  protected getRandomColor(): number {
    const colors = [
      VisualizationColors.Accent1,
      VisualizationColors.Accent2,
      VisualizationColors.Accent3,
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get color based on value (gradient)
   */
  protected getColorForValue(value: number, min: number, max: number): number {
    const ratio = (value - min) / (max - min);
    // Interpolate between cyan and pink
    const r = Math.round(0 + ratio * 255);
    const g = Math.round(217 - ratio * 217);
    const b = Math.round(255 - ratio * 145);
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Scale a value from one range to another
   */
  protected scale(value: number, from: [number, number], to: [number, number]): number {
    return ((value - from[0]) / (from[1] - from[0])) * (to[1] - to[0]) + to[0];
  }

  /**
   * Get container
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Dispose the layer
   */
  dispose(): void {
    this.container.removeChildren();
    this.container.destroy();
    this.bars = [];
    this.data = [];
  }
}

/**
 * ArrayVisualization - Renders arrays as vertical bars
 */
export class ArrayVisualization extends VisualizationLayer {
  private textStyle: TextStyle;

  constructor(engine: CanvasEngine, config: Partial<VisualizationConfig> = {}) {
    super(engine, config);

    this.textStyle = new TextStyle({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10,
      fill: 0xe0e0e0,
    });
  }

  /**
   * Set data and render
   */
  setData(data: number[]): void {
    this.data = [...data];
    // Only render if engine is ready
    if (this.engine.isReady()) {
      this.render();
    }
  }

  /**
   * Render bars
   */
  render(): void {
    // Safety check: don't render if engine is not ready
    if (!this.engine.isReady()) {
      return;
    }

    this.container.removeChildren();
    this.bars = [];

    if (this.data.length === 0) return;

    const { width, height } = this.engine.getDimensions();
    const { barGap, padding, minBarWidth, maxBarWidth, showValues } = this.config;

    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2 - 40; // Reserve space for values

    // Calculate bar width
    const totalGaps = (this.data.length - 1) * barGap;
    let barWidth = (availableWidth - totalGaps) / this.data.length;
    barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, barWidth));

    // Recalculate if bar width was clamped
    const totalWidth = barWidth * this.data.length + totalGaps;
    const startX = (width - totalWidth) / 2;

    const minVal = Math.min(...this.data);
    const maxVal = Math.max(...this.data);
    const valueRange = maxVal - minVal || 1;

    for (let i = 0; i < this.data.length; i++) {
      const value = this.data[i];
      const barHeight = ((value - minVal + 1) / (valueRange + 1)) * availableHeight;
      const x = startX + i * (barWidth + barGap);
      const y = height - padding - barHeight;

      const graphics = new Graphics();
      graphics.rect(0, 0, barWidth, barHeight);
      graphics.fill(VisualizationColors.Default);
      graphics.x = x;
      graphics.y = y;

      this.container.addChild(graphics);

      let textGraphics: Text | null = null;
      if (showValues && barWidth > 15) {
        textGraphics = new Text({ text: value.toString(), style: this.textStyle });
        textGraphics.x = x + barWidth / 2 - textGraphics.width / 2;
        textGraphics.y = y - 15;
        this.container.addChild(textGraphics);
      }

      this.bars.push({
        id: i,
        value,
        graphics,
        textGraphics,
        x,
        y,
        width: barWidth,
        height: barHeight,
        color: VisualizationColors.Default,
        state: 'default',
      });
    }
  }

  /**
   * Update visualization
   */
  update(data: number[]): void {
    this.data = [...data];
    this.updateBarsFromData();
  }

  /**
   * Update bar graphics to match current data
   */
  private updateBarsFromData(): void {
    // Safety check: don't update if engine is not ready
    if (!this.engine.isReady()) {
      return;
    }

    const { width, height } = this.engine.getDimensions();
    const { padding } = this.config;
    const availableHeight = height - padding * 2 - 40;

    const minVal = Math.min(...this.data);
    const maxVal = Math.max(...this.data);
    const valueRange = maxVal - minVal || 1;

    for (let i = 0; i < this.bars.length && i < this.data.length; i++) {
      const bar = this.bars[i];
      const value = this.data[i];
      const barHeight = ((value - minVal + 1) / (valueRange + 1)) * availableHeight;
      const y = height - padding - barHeight;

      bar.value = value;
      bar.height = barHeight;
      bar.y = y;

      if (bar.graphics) {
        bar.graphics.clear();
        bar.graphics.rect(0, 0, bar.width, barHeight);
        bar.graphics.fill(bar.color);
        bar.graphics.y = y;
      }

      if (bar.textGraphics) {
        bar.textGraphics.text = value.toString();
        bar.textGraphics.y = y - 15;
      }
    }
  }

  /**
   * Highlight specific bars
   */
  highlight(indices: number[], color: number): void {
    for (const index of indices) {
      if (index >= 0 && index < this.bars.length) {
        const bar = this.bars[index];
        bar.color = color;
        if (bar.graphics) {
          bar.graphics.clear();
          bar.graphics.rect(0, 0, bar.width, bar.height);
          bar.graphics.fill(color);
        }
      }
    }
  }

  /**
   * Set bar state (for highlighting)
   */
  setBarState(index: number, state: BarData['state']): void {
    if (index < 0 || index >= this.bars.length) return;

    const bar = this.bars[index];
    bar.state = state;

    let color: number;
    switch (state) {
      case 'comparing':
        color = VisualizationColors.Accent1;
        break;
      case 'swapping':
        color = VisualizationColors.Accent2;
        break;
      case 'sorted':
        color = VisualizationColors.Success;
        break;
      case 'pivot':
        color = VisualizationColors.Accent3;
        break;
      case 'min':
        color = VisualizationColors.Min;
        break;
      case 'max':
        color = VisualizationColors.Max;
        break;
      default:
        color = VisualizationColors.Default;
    }

    bar.color = color;
    if (bar.graphics) {
      bar.graphics.clear();
      bar.graphics.rect(0, 0, bar.width, bar.height);
      bar.graphics.fill(color);
    }
  }

  /**
   * Reset all bars to default state
   */
  resetBarStates(): void {
    for (let i = 0; i < this.bars.length; i++) {
      this.setBarState(i, 'default');
    }
  }

  /**
   * Swap bar values visually
   */
  swapBars(i: number, j: number): void {
    if (i < 0 || j < 0 || i >= this.data.length || j >= this.data.length) return;

    // Swap in data
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];

    // Update visuals
    this.updateBarsFromData();
  }

  /**
   * Get current data
   */
  getData(): number[] {
    return [...this.data];
  }

  /**
   * Get bar at index
   */
  getBar(index: number): BarData | undefined {
    return this.bars[index];
  }

  /**
   * Get all bars
   */
  getBars(): BarData[] {
    return [...this.bars];
  }

  /**
   * Reset visualization
   */
  reset(): void {
    this.data = [];
    this.bars = [];
    this.container.removeChildren();
  }
}

/**
 * TreeVisualization - Renders tree data structures
 */
export class TreeVisualization extends VisualizationLayer {
  render(): void {
    // TODO: Implement tree visualization
  }

  update(data: number[]): void {
    this.data = [...data];
  }

  highlight(indices: number[], color: number): void {
    // TODO: Implement highlighting
  }

  reset(): void {
    this.data = [];
    this.container.removeChildren();
  }
}

/**
 * GraphVisualization - Renders graph data structures
 */
export class GraphVisualization extends VisualizationLayer {
  render(): void {
    // TODO: Implement graph visualization
  }

  update(data: number[]): void {
    this.data = [...data];
  }

  highlight(indices: number[], color: number): void {
    // TODO: Implement highlighting
  }

  reset(): void {
    this.data = [];
    this.container.removeChildren();
  }
}
