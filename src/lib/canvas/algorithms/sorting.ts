/**
 * Sorting Algorithms - Implementations for visualization
 */

import type { SortingCallbacks, VisualizationStep } from '../AlgorithmEngine';

/**
 * Bubble Sort
 * Time: O(n²) | Space: O(1) | Stable: Yes
 */
export async function* bubbleSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (callbacks.shouldStop()) return;

      // Compare adjacent elements
      const shouldSwap = await callbacks.compare(j, j + 1);

      yield { type: 'compare', indices: [j, j + 1] };

      if (shouldSwap) {
        await callbacks.swap(j, j + 1);
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        yield { type: 'swap', indices: [j, j + 1] };
      }
    }

    // Mark the last element as sorted
    await callbacks.markSorted([n - i - 1]);

    // Early termination if no swaps
    if (!swapped) {
      // Mark remaining as sorted
      for (let k = 0; k < n - i - 1; k++) {
        await callbacks.markSorted([k]);
      }
      break;
    }
  }

  // Mark first element as sorted
  await callbacks.markSorted([0]);

  yield { type: 'complete', indices: [] };
}

/**
 * Selection Sort
 * Time: O(n²) | Space: O(1) | Stable: No
 */
export async function* selectionSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    if (callbacks.shouldStop()) return;

    let minIdx = i;
    await callbacks.highlight([i], 'min');

    for (let j = i + 1; j < n; j++) {
      if (callbacks.shouldStop()) return;

      // Compare with current minimum
      const isGreater = await callbacks.compare(minIdx, j);

      yield { type: 'compare', indices: [minIdx, j] };

      if (isGreater) {
        await callbacks.highlight([minIdx], 'default');
        minIdx = j;
        await callbacks.highlight([minIdx], 'min');
      }
    }

    // Swap if needed
    if (minIdx !== i) {
      await callbacks.swap(i, minIdx);
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];

      yield { type: 'swap', indices: [i, minIdx] };
    }

    await callbacks.markSorted([i]);
  }

  // Mark last element as sorted
  await callbacks.markSorted([n - 1]);

  yield { type: 'complete', indices: [] };
}

/**
 * Insertion Sort
 * Time: O(n²) | Space: O(1) | Stable: Yes
 */
export async function* insertionSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  const n = arr.length;

  await callbacks.markSorted([0]);

  for (let i = 1; i < n; i++) {
    if (callbacks.shouldStop()) return;

    const key = arr[i];
    let j = i - 1;

    await callbacks.highlight([i], 'pivot');

    // Move elements greater than key
    while (j >= 0) {
      if (callbacks.shouldStop()) return;

      const shouldMove = await callbacks.compare(j, i);

      yield { type: 'compare', indices: [j, i] };

      if (!shouldMove) break;

      await callbacks.swap(j, j + 1);
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

      yield { type: 'swap', indices: [j, j + 1] };

      j--;
    }

    arr[j + 1] = key;
    await callbacks.markSorted([i]);
  }

  yield { type: 'complete', indices: [] };
}

/**
 * Merge Sort
 * Time: O(n log n) | Space: O(n) | Stable: Yes
 */
export async function* mergeSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  async function* mergeSortHelper(
    start: number,
    end: number
  ): AsyncGenerator<VisualizationStep, void, unknown> {
    if (start >= end || callbacks.shouldStop()) return;

    const mid = Math.floor((start + end) / 2);

    // Recursively sort left half
    yield* mergeSortHelper(start, mid);
    if (callbacks.shouldStop()) return;

    // Recursively sort right half
    yield* mergeSortHelper(mid + 1, end);
    if (callbacks.shouldStop()) return;

    // Merge the sorted halves
    yield* merge(start, mid, end);
  }

  async function* merge(
    start: number,
    mid: number,
    end: number
  ): AsyncGenerator<VisualizationStep, void, unknown> {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);

    let i = 0,
      j = 0,
      k = start;

    // Highlight the subarrays being merged
    const indices = Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    await callbacks.highlight(indices, 'comparing');

    while (i < left.length && j < right.length) {
      if (callbacks.shouldStop()) return;

      await callbacks.highlight([start + i, mid + 1 + j], 'comparing');

      yield { type: 'compare', indices: [start + i, mid + 1 + j] };

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        await callbacks.set(k, left[i]);
        i++;
      } else {
        arr[k] = right[j];
        await callbacks.set(k, right[j]);
        j++;
      }
      k++;
    }

    // Copy remaining elements
    while (i < left.length) {
      if (callbacks.shouldStop()) return;
      arr[k] = left[i];
      await callbacks.set(k, left[i]);
      i++;
      k++;
    }

    while (j < right.length) {
      if (callbacks.shouldStop()) return;
      arr[k] = right[j];
      await callbacks.set(k, right[j]);
      j++;
      k++;
    }

    // Reset highlights
    for (let idx = start; idx <= end; idx++) {
      await callbacks.highlight([idx], 'default');
    }
  }

  yield* mergeSortHelper(0, arr.length - 1);

  // Mark all as sorted
  if (!callbacks.shouldStop()) {
    for (let i = 0; i < arr.length; i++) {
      await callbacks.markSorted([i]);
    }
  }

  yield { type: 'complete', indices: [] };
}

/**
 * Quick Sort
 * Time: O(n log n) avg, O(n²) worst | Space: O(log n) | Stable: No
 */
export async function* quickSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  async function* quickSortHelper(
    low: number,
    high: number
  ): AsyncGenerator<VisualizationStep, void, unknown> {
    if (low >= high || callbacks.shouldStop()) return;

    // Partition inline to avoid nested generator issues
    const pivot = arr[high];
    await callbacks.highlight([high], 'pivot');
    yield { type: 'pivot', indices: [high] };

    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (callbacks.shouldStop()) return;

      await callbacks.highlight([j], 'comparing');
      yield { type: 'compare', indices: [j, high] };

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          await callbacks.swap(i, j);
          [arr[i], arr[j]] = [arr[j], arr[i]];
          yield { type: 'swap', indices: [i, j] };
        }
      }

      await callbacks.highlight([j], 'default');
    }

    // Place pivot in correct position
    const pivotIdx = i + 1;
    if (pivotIdx !== high) {
      await callbacks.swap(pivotIdx, high);
      [arr[pivotIdx], arr[high]] = [arr[high], arr[pivotIdx]];
      yield { type: 'swap', indices: [pivotIdx, high] };
    }

    await callbacks.highlight([high], 'default');
    await callbacks.markSorted([pivotIdx]);

    // Recursively sort left and right partitions
    yield* quickSortHelper(low, pivotIdx - 1);
    yield* quickSortHelper(pivotIdx + 1, high);
  }

  yield* quickSortHelper(0, arr.length - 1);

  // Mark remaining as sorted
  if (!callbacks.shouldStop()) {
    for (let i = 0; i < arr.length; i++) {
      await callbacks.markSorted([i]);
    }
  }

  yield { type: 'complete', indices: [] };
}

/**
 * Heap Sort
 * Time: O(n log n) | Space: O(1) | Stable: No
 */
export async function* heapSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  const n = arr.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    if (callbacks.shouldStop()) return;
    yield* heapify(n, i);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    if (callbacks.shouldStop()) return;

    // Move root to end
    await callbacks.swap(0, i);
    [arr[0], arr[i]] = [arr[i], arr[0]];

    yield { type: 'swap', indices: [0, i] };

    await callbacks.markSorted([i]);

    // Heapify reduced heap
    yield* heapify(i, 0);
  }

  await callbacks.markSorted([0]);

  async function* heapify(
    heapSize: number,
    rootIdx: number
  ): AsyncGenerator<VisualizationStep, void, unknown> {
    let largest = rootIdx;
    const left = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;

    // Compare with left child
    if (left < heapSize) {
      if (callbacks.shouldStop()) return;

      await callbacks.compare(largest, left);
      yield { type: 'compare', indices: [largest, left] };

      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    // Compare with right child
    if (right < heapSize) {
      if (callbacks.shouldStop()) return;

      await callbacks.compare(largest, right);
      yield { type: 'compare', indices: [largest, right] };

      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    // Swap if root is not largest
    if (largest !== rootIdx) {
      await callbacks.swap(rootIdx, largest);
      [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];

      yield { type: 'swap', indices: [rootIdx, largest] };

      // Recursively heapify
      yield* heapify(heapSize, largest);
    }
  }

  yield { type: 'complete', indices: [] };
}

/**
 * Counting Sort
 * Time: O(n + k) | Space: O(k) | Stable: Yes
 * Where k is the range of input values
 */
export async function* countingSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  if (arr.length === 0) return;

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  const output = new Array(arr.length);

  // Count occurrences
  for (let i = 0; i < arr.length; i++) {
    if (callbacks.shouldStop()) return;
    count[arr[i] - min]++;
    await callbacks.highlight([i], 'comparing');
    yield { type: 'highlight', indices: [i] };
    await callbacks.highlight([i], 'default');
  }

  // Calculate cumulative count
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
  }

  // Build output array
  for (let i = arr.length - 1; i >= 0; i--) {
    if (callbacks.shouldStop()) return;

    const value = arr[i];
    const pos = count[value - min] - 1;
    output[pos] = value;
    count[value - min]--;

    await callbacks.highlight([i], 'comparing');
    yield { type: 'highlight', indices: [i] };
  }

  // Copy back to original array
  for (let i = 0; i < arr.length; i++) {
    if (callbacks.shouldStop()) return;

    arr[i] = output[i];
    await callbacks.set(i, output[i]);
    await callbacks.markSorted([i]);

    yield { type: 'set', indices: [i], values: [output[i]] };
  }

  yield { type: 'complete', indices: [] };
}

/**
 * Radix Sort (LSD)
 * Time: O(d * (n + k)) | Space: O(n + k) | Stable: Yes
 * Where d is the number of digits and k is the base (10)
 */
export async function* radixSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  if (arr.length === 0) return;

  const max = Math.max(...arr);
  let exp = 1;

  while (Math.floor(max / exp) > 0) {
    if (callbacks.shouldStop()) return;

    yield* countingSortByDigit(arr, exp, callbacks);
    exp *= 10;
  }

  // Mark all as sorted
  for (let i = 0; i < arr.length; i++) {
    await callbacks.markSorted([i]);
  }

  yield { type: 'complete', indices: [] };
}

async function* countingSortByDigit(
  arr: number[],
  exp: number,
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  const n = arr.length;
  const output = new Array(n);
  const count = new Array(10).fill(0);

  // Count occurrences of each digit
  for (let i = 0; i < n; i++) {
    if (callbacks.shouldStop()) return;
    const digit = Math.floor(arr[i] / exp) % 10;
    count[digit]++;

    await callbacks.highlight([i], 'comparing');
    yield { type: 'highlight', indices: [i] };
    await callbacks.highlight([i], 'default');
  }

  // Calculate cumulative count
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  // Build output array
  for (let i = n - 1; i >= 0; i--) {
    if (callbacks.shouldStop()) return;

    const digit = Math.floor(arr[i] / exp) % 10;
    const pos = count[digit] - 1;
    output[pos] = arr[i];
    count[digit]--;
  }

  // Copy back to original array
  for (let i = 0; i < n; i++) {
    if (callbacks.shouldStop()) return;

    arr[i] = output[i];
    await callbacks.set(i, output[i]);

    yield { type: 'set', indices: [i], values: [output[i]] };
  }
}

/**
 * Shell Sort
 * Time: O(n log n) to O(n²) | Space: O(1) | Stable: No
 */
export async function* shellSort(
  arr: number[],
  callbacks: SortingCallbacks
): AsyncGenerator<VisualizationStep, void, unknown> {
  const n = arr.length;

  // Start with large gap and reduce
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      if (callbacks.shouldStop()) return;

      const temp = arr[i];
      let j = i;

      await callbacks.highlight([i], 'pivot');

      while (j >= gap) {
        if (callbacks.shouldStop()) return;

        const shouldSwap = await callbacks.compare(j - gap, j);
        yield { type: 'compare', indices: [j - gap, j] };

        if (!shouldSwap) break;

        await callbacks.swap(j - gap, j);
        [arr[j - gap], arr[j]] = [arr[j], arr[j - gap]];

        yield { type: 'swap', indices: [j - gap, j] };

        j -= gap;
      }

      arr[j] = temp;
      await callbacks.highlight([i], 'default');
    }
  }

  // Mark all as sorted
  for (let i = 0; i < n; i++) {
    await callbacks.markSorted([i]);
  }

  yield { type: 'complete', indices: [] };
}

// Algorithm registry
export const sortingAlgorithms = {
  'bubble-sort': bubbleSort,
  'selection-sort': selectionSort,
  'insertion-sort': insertionSort,
  'merge-sort': mergeSort,
  'quick-sort': quickSort,
  'heap-sort': heapSort,
  'counting-sort': countingSort,
  'radix-sort': radixSort,
  'shell-sort': shellSort,
} as const;

export type SortingAlgorithmName = keyof typeof sortingAlgorithms;

export function getSortingAlgorithm(name: string) {
  return sortingAlgorithms[name as SortingAlgorithmName] || null;
}

export function getSortingAlgorithmNames(): string[] {
  return Object.keys(sortingAlgorithms);
}

export function isSortingAlgorithm(name: string): boolean {
  return name in sortingAlgorithms;
}
