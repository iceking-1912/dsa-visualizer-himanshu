/**
 * Visualization Theme - Colors and animation speeds
 */

// Visualization colors (as hex numbers for Pixi.js)
export const VisualizationColors = {
  Default: 0x5b6d99,     // Neutral blue-gray
  Accent1: 0x00d9ff,     // Cyan (comparisons)
  Accent2: 0xff006e,     // Pink (swaps)
  Accent3: 0x8338ec,     // Purple (pivot)
  Success: 0x00ff88,     // Green (sorted)
  Error: 0xff0040,       // Red (invalid)
  Min: 0x00d9ff,         // Cyan (minimum) - alias for Accent1
  Max: 0xff006e,         // Pink (maximum) - alias for Accent2
  Visited: 0x8338ec,     // Purple (visited) - alias for Accent3
  Unvisited: 0x606060,   // Dark gray (unvisited)
  Background: 0x0a0a0a,  // Deep black
  Surface: 0x1a1a1a,     // Dark surface
  Text: 0xe0e0e0,        // Light text
  TextSecondary: 0xa0a0a0, // Secondary text
} as const;

// Animation speed mapping (speed level to milliseconds per step)
export const animationSpeed: Record<number, number> = {
  1: 1000,   // Very slow
  2: 800,
  3: 600,
  4: 400,
  5: 250,    // Normal
  6: 150,
  7: 100,
  8: 50,
  9: 25,
  10: 10,    // Very fast
};

/**
 * Get delay in milliseconds for a given speed level
 */
export function getDelayForSpeed(speed: number): number {
  return animationSpeed[Math.max(1, Math.min(10, speed))] ?? animationSpeed[5];
}

/**
 * Convert hex string to number
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/**
 * Convert number to hex string
 */
export function numberToHex(num: number): string {
  return '#' + num.toString(16).padStart(6, '0');
}

/**
 * Interpolate between two colors
 */
export function lerpColor(color1: number, color2: number, t: number): number {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;

  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
}

/**
 * Generate a gradient of colors for array values
 */
export function generateColorGradient(length: number): number[] {
  const colors: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / (length - 1);
    colors.push(lerpColor(VisualizationColors.Accent1, VisualizationColors.Accent2, t));
  }
  return colors;
}
