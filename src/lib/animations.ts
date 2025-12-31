// Animation utilities and easing functions

import { design } from '@/constants/design';

export type EasingFunction = (t: number) => number;

// Easing functions
export const easings = {
  linear: (t: number): number => t,
  
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
} as const;

// Animation configuration
export interface AnimationConfig {
  duration: number;
  easing: EasingFunction;
  delay?: number;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
}

// Animation state
export interface AnimationState {
  startTime: number;
  duration: number;
  isRunning: boolean;
  progress: number;
}

// Create an animation frame loop
export function createAnimationLoop(
  callback: (deltaTime: number) => boolean
): { start: () => void; stop: () => void } {
  let animationFrameId: number | null = null;
  let lastTime = 0;

  const loop = (currentTime: number) => {
    const deltaTime = lastTime ? currentTime - lastTime : 0;
    lastTime = currentTime;

    const shouldContinue = callback(deltaTime);
    if (shouldContinue) {
      animationFrameId = requestAnimationFrame(loop);
    }
  };

  return {
    start: () => {
      if (!animationFrameId) {
        lastTime = 0;
        animationFrameId = requestAnimationFrame(loop);
      }
    },
    stop: () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
}

// Animate a value over time
export function animateValue(
  from: number,
  to: number,
  config: AnimationConfig
): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const diff = to - from;

    const animate = () => {
      const elapsed = performance.now() - startTime - (config.delay || 0);
      
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / config.duration, 1);
      const easedProgress = config.easing(progress);
      const currentValue = from + diff * easedProgress;

      config.onUpdate?.(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        config.onComplete?.();
        resolve(to);
      }
    };

    requestAnimationFrame(animate);
  });
}

// Delay utility
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get delay based on animation speed (1-10)
export function getDelayFromSpeed(speed: number, baseDelay: number = 100): number {
  // Speed 1 = slowest (1000ms), Speed 10 = fastest (10ms)
  const normalizedSpeed = Math.max(1, Math.min(10, speed));
  return Math.max(10, baseDelay * (11 - normalizedSpeed) / 10);
}

// Color interpolation for smooth transitions
export function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);

  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Get bar colors based on state
export function getBarColor(state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot'): string {
  switch (state) {
    case 'comparing':
      return design.colors.cyan;
    case 'swapping':
      return design.colors.pink;
    case 'sorted':
      return design.colors.green;
    case 'pivot':
      return design.colors.purple;
    default:
      return design.colors.text;
  }
}

// Flash animation for elements
export async function flashElement(
  updateFn: (color: string) => void,
  flashColor: string,
  originalColor: string,
  duration: number = 200
): Promise<void> {
  updateFn(flashColor);
  await delay(duration);
  updateFn(originalColor);
}
