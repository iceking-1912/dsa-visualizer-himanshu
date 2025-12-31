// Utility functions for the DSA Visualizer

import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names using clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Delays execution for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a random array of numbers
 */
export function generateRandomArray(size: number, min = 5, max = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Formats a path array to string
 */
export function formatPath(path: string[]): string {
  return '~/' + path.join('/');
}

/**
 * Parses a path string to array
 */
export function parsePath(pathStr: string): string[] {
  const cleaned = pathStr.replace(/^~?\/?/, '').replace(/\/$/, '');
  return cleaned ? cleaned.split('/').filter(Boolean) : [];
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Capitalizes first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts kebab-case to Title Case
 */
export function kebabToTitle(str: string): string {
  return str
    .split('-')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Converts Title Case to kebab-case
 */
export function titleToKebab(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Levenshtein distance for fuzzy matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Finds the closest match from a list of strings
 */
export function findClosestMatch(input: string, options: string[]): string | null {
  if (options.length === 0) return null;

  let closest = options[0];
  let minDistance = levenshteinDistance(input.toLowerCase(), closest.toLowerCase());

  for (const option of options) {
    const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase());
    if (distance < minDistance) {
      minDistance = distance;
      closest = option;
    }
  }

  // Only return if reasonably close (within 3 edits for short strings)
  return minDistance <= Math.max(3, Math.floor(input.length / 2)) ? closest : null;
}
