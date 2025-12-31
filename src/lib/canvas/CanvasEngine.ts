/**
 * CanvasEngine - Core Pixi.js rendering engine
 * Manages canvas initialization, layers, and primitive drawing
 */

import { Application, Graphics, Text, Container, TextStyle } from 'pixi.js';
import type { AnimationManager } from './AnimationManager';
import { design } from '@/constants/design';

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: number;
  targetFPS: number;
  antiAlias: boolean;
  resolution: number;
}

const defaultConfig: CanvasConfig = {
  width: 800,
  height: 600,
  backgroundColor: 0x0a0a0a,
  targetFPS: 60,
  antiAlias: true,
  resolution: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
};

export class CanvasEngine {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private config: CanvasConfig;
  private layers: Map<string, Container> = new Map();
  private animationManager: AnimationManager | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private isDisposed = false;
  private resizeObserver: ResizeObserver | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;

  constructor(config: Partial<CanvasConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Initialize the canvas engine
   */
  async initialize(container: HTMLElement): Promise<void> {
    // If already initialized with the same container, skip
    if (this.isInitialized && this.container === container) {
      return;
    }

    // If initializing with a different container, dispose first
    if (this.isInitialized || this.isInitializing) {
      if (this.container !== container) {
        this.dispose();
      } else {
        return;
      }
    }

    this.isInitializing = true;
    this.isDisposed = false;
    this.container = container;

    const app = new Application();
    this.app = app;

    try {
      // Ensure we have valid dimensions
      const width = Math.max(container.clientWidth, 300) || this.config.width;
      const height = Math.max(container.clientHeight, 200) || this.config.height;

      await app.init({
        width,
        height,
        backgroundColor: this.config.backgroundColor,
        antialias: this.config.antiAlias,
        resolution: this.config.resolution,
        autoDensity: true,
        // Use webgpu if available, fallback to webgl
        preference: 'webgl',
        powerPreference: 'high-performance',
      });

      // Check if we were disposed during async init (React Strict Mode)
      if (this.app !== app || !this.isInitializing || this.isDisposed) {
        // Clean up this orphaned app
        try {
          app.destroy(true, { children: true, texture: true });
        } catch {
          // Ignore cleanup errors
        }
        return;
      }

      const canvas = app.canvas as HTMLCanvasElement;
      // Ensure canvas fills its container
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      container.appendChild(canvas);

      // Handle WebGL context loss
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        // Only log in development to avoid console noise in production
        if (process.env.NODE_ENV === 'development') {
          console.debug('WebGL context lost - this is normal during hot reload');
        }
      });

      canvas.addEventListener('webglcontextrestored', () => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('WebGL context restored');
        }
        this.isInitialized = true;
      });

      // Create default layers
      this.addLayer('background', 0);
      this.addLayer('data', 1);
      this.addLayer('visualization', 2);
      this.addLayer('overlay', 3);
      this.addLayer('ui', 4);

      // Setup resize observer
      this.setupResizeObserver();

      // Setup update loop
      app.ticker.add((ticker) => {
        this.update(ticker.deltaTime);
      });

      this.isInitialized = true;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Setup resize observer for responsive canvas
   */
  private setupResizeObserver(): void {
    if (!this.container || !this.app) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.app?.renderer.resize(width, height);
          this.config.width = width;
          this.config.height = height;
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Main update loop
   */
  update(deltaTime: number): void {
    // Update FPS counter
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }

    // Update animation manager
    if (this.animationManager) {
      this.animationManager.updateAll(deltaTime);
    }
  }

  /**
   * Set animation manager reference
   */
  setAnimationManager(manager: AnimationManager): void {
    this.animationManager = manager;
  }

  /**
   * Clear all layers
   */
  clear(): void {
    for (const layer of this.layers.values()) {
      layer.removeChildren();
    }
  }

  /**
   * Clear specific layer
   */
  clearLayer(name: string): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.removeChildren();
    }
  }

  /**
   * Add a new layer
   */
  addLayer(name: string, zIndex: number): Container {
    if (!this.app || !this.app.stage) {
      throw new Error('CanvasEngine not initialized');
    }

    const container = new Container();
    container.label = name;
    container.zIndex = zIndex;
    this.app.stage.addChild(container);
    this.app.stage.sortChildren();
    this.layers.set(name, container);
    return container;
  }

  /**
   * Get layer by name
   */
  getLayer(name: string): Container | undefined {
    return this.layers.get(name);
  }

  /**
   * Get Pixi application
   */
  getApp(): Application | null {
    return this.app;
  }

  /**
   * Get current dimensions
   */
  getDimensions(): { width: number; height: number } {
    // Safely access screen dimensions with null checks
    try {
      if (this.app && this.app.renderer && this.app.screen) {
        return {
          width: this.app.screen.width || this.config.width,
          height: this.app.screen.height || this.config.height,
        };
      }
    } catch {
      // Ignore errors when accessing screen (e.g., WebGL context lost)
    }
    return {
      width: this.config.width,
      height: this.config.height,
    };
  }

  /**
   * Check if the engine is ready for rendering
   */
  isReady(): boolean {
    return this.isInitialized && !this.isDisposed && this.app !== null && this.app.renderer !== null;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Check if initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Draw a rectangle
   */
  drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    parent?: Container
  ): Graphics {
    const graphics = new Graphics();
    graphics.rect(x, y, width, height);
    graphics.fill(color);

    const container = parent || this.getLayer('visualization');
    container?.addChild(graphics);

    return graphics;
  }

  /**
   * Draw a circle
   */
  drawCircle(
    x: number,
    y: number,
    radius: number,
    color: number,
    parent?: Container
  ): Graphics {
    const graphics = new Graphics();
    graphics.circle(x, y, radius);
    graphics.fill(color);

    const container = parent || this.getLayer('visualization');
    container?.addChild(graphics);

    return graphics;
  }

  /**
   * Draw a line
   */
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number,
    color: number,
    parent?: Container
  ): Graphics {
    const graphics = new Graphics();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.stroke({ width: thickness, color });

    const container = parent || this.getLayer('visualization');
    container?.addChild(graphics);

    return graphics;
  }

  /**
   * Draw text
   */
  drawText(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: number,
    parent?: Container
  ): Text {
    const style = new TextStyle({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize,
      fill: color,
    });

    const textObj = new Text({ text, style });
    textObj.x = x;
    textObj.y = y;

    const container = parent || this.getLayer('ui');
    container?.addChild(textObj);

    return textObj;
  }

  /**
   * Draw a rounded rectangle
   */
  drawRoundedRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: number,
    parent?: Container
  ): Graphics {
    const graphics = new Graphics();
    graphics.roundRect(x, y, width, height, radius);
    graphics.fill(color);

    const container = parent || this.getLayer('visualization');
    container?.addChild(graphics);

    return graphics;
  }

  /**
   * Draw a bar with optional border
   */
  drawBar(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    borderColor?: number,
    borderWidth = 1,
    parent?: Container
  ): Graphics {
    const graphics = new Graphics();
    graphics.rect(x, y, width, height);
    graphics.fill(fillColor);

    if (borderColor !== undefined) {
      graphics.stroke({ width: borderWidth, color: borderColor });
    }

    const container = parent || this.getLayer('visualization');
    container?.addChild(graphics);

    return graphics;
  }

  /**
   * Dispose and cleanup
   */
  dispose(): void {
    this.isDisposed = true;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    const app = this.app;

    // If dispose is called while initializing (e.g., StrictMode double-invoke),
    // avoid calling destroy on a partially constructed app.
    if (this.isInitializing && !this.isInitialized) {
      this.app = null;
      this.isInitializing = false;
      this.layers.clear();
      this.container = null;
      return;
    }

    this.app = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.layers.clear();
    this.container = null;

    if (app && app.renderer) {
      try {
        app.destroy(true, { children: true, texture: true });
      } catch (error) {
        console.warn('CanvasEngine dispose skipped destroy:', error);
      }
    }
  }
}

// Create singleton instance
let canvasEngineInstance: CanvasEngine | null = null;

export function getCanvasEngine(): CanvasEngine {
  if (!canvasEngineInstance) {
    canvasEngineInstance = new CanvasEngine();
  }
  return canvasEngineInstance;
}

export function resetCanvasEngine(): void {
  if (canvasEngineInstance) {
    canvasEngineInstance.dispose();
    canvasEngineInstance = null;
  }
}
