/**
 * AnimationManager - Manages frame-based animations
 * Supports sequential and parallel animations with easing
 */

import type { Container } from 'pixi.js';

export enum EasingFunction {
  Linear = 'linear',
  EaseIn = 'easeIn',
  EaseOut = 'easeOut',
  EaseInOut = 'easeInOut',
  ElasticOut = 'elasticOut',
  BounceOut = 'bounceOut',
}

export interface Animation {
  id?: string;
  target: Container;
  properties: Record<string, number>;
  duration: number;
  easing: EasingFunction;
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

interface ActiveAnimation {
  id: string;
  animation: Animation;
  startValues: Record<string, number>;
  elapsed: number;
  isDelaying: boolean;
  isPaused: boolean;
}

// Easing functions
const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  [EasingFunction.Linear]: (t) => t,
  [EasingFunction.EaseIn]: (t) => t * t,
  [EasingFunction.EaseOut]: (t) => t * (2 - t),
  [EasingFunction.EaseInOut]: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  [EasingFunction.ElasticOut]: (t) => {
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
  },
  [EasingFunction.BounceOut]: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      const t2 = t - 1.5 / 2.75;
      return 7.5625 * t2 * t2 + 0.75;
    } else if (t < 2.5 / 2.75) {
      const t2 = t - 2.25 / 2.75;
      return 7.5625 * t2 * t2 + 0.9375;
    } else {
      const t2 = t - 2.625 / 2.75;
      return 7.5625 * t2 * t2 + 0.984375;
    }
  },
};

export class AnimationManager {
  private animations: Map<string, ActiveAnimation> = new Map();
  private idCounter = 0;
  private isPaused = false;
  private globalSpeed = 1;

  /**
   * Add an animation
   */
  addAnimation(animation: Animation): string {
    const id = animation.id || `anim_${++this.idCounter}`;

    // Store starting values
    const startValues: Record<string, number> = {};
    for (const prop of Object.keys(animation.properties)) {
      startValues[prop] = (animation.target as unknown as Record<string, number>)[prop] ?? 0;
    }

    this.animations.set(id, {
      id,
      animation,
      startValues,
      elapsed: 0,
      isDelaying: (animation.delay || 0) > 0,
      isPaused: false,
    });

    return id;
  }

  /**
   * Remove an animation
   */
  removeAnimation(id: string): void {
    this.animations.delete(id);
  }

  /**
   * Pause specific animation
   */
  pauseAnimation(id: string): void {
    const anim = this.animations.get(id);
    if (anim) {
      anim.isPaused = true;
    }
  }

  /**
   * Resume specific animation
   */
  resumeAnimation(id: string): void {
    const anim = this.animations.get(id);
    if (anim) {
      anim.isPaused = false;
    }
  }

  /**
   * Pause all animations
   */
  pauseAll(): void {
    this.isPaused = true;
  }

  /**
   * Resume all animations
   */
  resumeAll(): void {
    this.isPaused = false;
  }

  /**
   * Set global animation speed multiplier
   */
  setSpeed(speed: number): void {
    this.globalSpeed = Math.max(0.1, Math.min(10, speed));
  }

  /**
   * Get global animation speed
   */
  getSpeed(): number {
    return this.globalSpeed;
  }

  /**
   * Update all animations (called each frame)
   */
  updateAll(deltaTime: number): void {
    if (this.isPaused) return;

    const frameTime = (deltaTime / 60) * 1000 * this.globalSpeed; // Convert to ms
    const completedIds: string[] = [];

    for (const [id, active] of this.animations) {
      if (active.isPaused) continue;

      // Handle delay
      if (active.isDelaying) {
        const delay = active.animation.delay || 0;
        active.elapsed += frameTime;
        if (active.elapsed >= delay) {
          active.isDelaying = false;
          active.elapsed = active.elapsed - delay;
        } else {
          continue;
        }
      }

      // Update animation
      active.elapsed += frameTime;
      const progress = Math.min(active.elapsed / active.animation.duration, 1);
      const easedProgress = easingFunctions[active.animation.easing](progress);

      // Apply property changes
      for (const [prop, endValue] of Object.entries(active.animation.properties)) {
        const startValue = active.startValues[prop];
        const currentValue = startValue + (endValue - startValue) * easedProgress;
        (active.animation.target as unknown as Record<string, number>)[prop] = currentValue;
      }

      // Call update callback
      if (active.animation.onUpdate) {
        active.animation.onUpdate(easedProgress);
      }

      // Check completion
      if (progress >= 1) {
        completedIds.push(id);
        if (active.animation.onComplete) {
          active.animation.onComplete();
        }
      }
    }

    // Remove completed animations
    for (const id of completedIds) {
      this.animations.delete(id);
    }
  }

  /**
   * Clear all animations
   */
  clearAll(): void {
    this.animations.clear();
  }

  /**
   * Get animation count
   */
  getAnimationCount(): number {
    return this.animations.size;
  }

  /**
   * Check if any animations are running
   */
  isAnimating(): boolean {
    return this.animations.size > 0;
  }

  /**
   * Run animations in sequence
   */
  async sequence(animations: Animation[], callback?: () => void): Promise<void> {
    for (const animation of animations) {
      await this.runAnimation(animation);
    }
    if (callback) callback();
  }

  /**
   * Run animations in parallel
   */
  async parallel(animations: Animation[], callback?: () => void): Promise<void> {
    const promises = animations.map((animation) => this.runAnimation(animation));
    await Promise.all(promises);
    if (callback) callback();
  }

  /**
   * Run a single animation and return a promise
   */
  private runAnimation(animation: Animation): Promise<void> {
    return new Promise((resolve) => {
      const originalOnComplete = animation.onComplete;
      animation.onComplete = () => {
        if (originalOnComplete) originalOnComplete();
        resolve();
      };
      this.addAnimation(animation);
    });
  }

  /**
   * Create a delay animation (useful for sequencing)
   */
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Create singleton instance
let animationManagerInstance: AnimationManager | null = null;

export function getAnimationManager(): AnimationManager {
  if (!animationManagerInstance) {
    animationManagerInstance = new AnimationManager();
  }
  return animationManagerInstance;
}

export function resetAnimationManager(): void {
  if (animationManagerInstance) {
    animationManagerInstance.clearAll();
    animationManagerInstance = null;
  }
}
