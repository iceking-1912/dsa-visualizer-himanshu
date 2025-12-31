/**
 * DataGenerator - Generates test data for visualizations
 */

/**
 * Generate random array
 */
export function randomArray(size: number, min = 5, max = 100): number[] {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}

/**
 * Generate nearly sorted array (90% sorted)
 */
export function nearlySorted(size: number, min = 5, max = 100): number[] {
  const arr = sortedArray(size, min, max);
  const swaps = Math.floor(size * 0.1);
  
  for (let i = 0; i < swaps; i++) {
    const idx1 = Math.floor(Math.random() * size);
    const idx2 = Math.floor(Math.random() * size);
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  }
  
  return arr;
}

/**
 * Generate reverse sorted array
 */
export function reverseSorted(size: number, min = 5, max = 100): number[] {
  return sortedArray(size, min, max).reverse();
}

/**
 * Generate sorted array
 */
export function sortedArray(size: number, min = 5, max = 100): number[] {
  const step = (max - min) / (size - 1);
  return Array.from({ length: size }, (_, i) => Math.round(min + step * i));
}

/**
 * Generate array with many duplicates
 */
export function duplicates(size: number, uniqueValues = 10, min = 5, max = 100): number[] {
  const values = randomArray(uniqueValues, min, max);
  return Array.from({ length: size }, () =>
    values[Math.floor(Math.random() * values.length)]
  );
}

/**
 * Generate array with specific pattern
 */
export function pattern(size: number, patternType: 'wave' | 'sawtooth' | 'pyramid'): number[] {
  const arr: number[] = [];
  
  switch (patternType) {
    case 'wave':
      for (let i = 0; i < size; i++) {
        arr.push(Math.round(50 + 45 * Math.sin((i / size) * Math.PI * 4)));
      }
      break;
      
    case 'sawtooth':
      const teethCount = Math.ceil(size / 10);
      const toothSize = Math.ceil(size / teethCount);
      for (let i = 0; i < size; i++) {
        arr.push(5 + (i % toothSize) * (95 / toothSize));
      }
      break;
      
    case 'pyramid':
      const mid = Math.floor(size / 2);
      for (let i = 0; i < size; i++) {
        if (i <= mid) {
          arr.push(5 + (i / mid) * 95);
        } else {
          arr.push(5 + ((size - 1 - i) / mid) * 95);
        }
      }
      break;
  }
  
  return arr.map(Math.round);
}

/**
 * Generate array optimized for visualization (unique values, good distribution)
 */
export function generateForVisualization(size: number, seed?: number): number[] {
  // Use a simple seeded random if seed is provided
  let random = Math.random;
  if (seed !== undefined) {
    let s = seed;
    random = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }
  
  // Generate unique values with good distribution
  const values: number[] = [];
  const step = 95 / size;
  
  for (let i = 0; i < size; i++) {
    const base = 5 + step * i;
    const jitter = (random() - 0.5) * step * 0.5;
    values.push(Math.round(base + jitter));
  }
  
  // Shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  
  return values;
}

/**
 * Parse array from string input (e.g., "1,2,3,4,5" or "[1,2,3,4,5]")
 */
export function parseArrayInput(input: string): number[] | null {
  try {
    // Remove brackets and whitespace
    const cleaned = input.replace(/[\[\]\s]/g, '');
    if (!cleaned) return null;
    
    const values = cleaned.split(',').map((v) => {
      const num = parseInt(v.trim(), 10);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    });
    
    return values.length > 0 ? values : null;
  } catch {
    return null;
  }
}

/**
 * Validate array for visualization
 */
export function validateArray(arr: number[], maxSize = 500): { valid: boolean; error?: string } {
  if (!Array.isArray(arr)) {
    return { valid: false, error: 'Input must be an array' };
  }
  
  if (arr.length === 0) {
    return { valid: false, error: 'Array cannot be empty' };
  }
  
  if (arr.length > maxSize) {
    return { valid: false, error: `Array size cannot exceed ${maxSize}` };
  }
  
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number' || isNaN(arr[i])) {
      return { valid: false, error: `Invalid value at index ${i}` };
    }
  }
  
  return { valid: true };
}

// DataGenerator class for compatibility
export class DataGenerator {
  randomArray = randomArray;
  nearlySorted = nearlySorted;
  reverseSorted = reverseSorted;
  almostSorted = nearlySorted; // Alias
  duplicates = duplicates;
  generateForVisualization = generateForVisualization;
}

export const dataGenerator = new DataGenerator();
