'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/stores/app.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { getAlgorithmById, ALL_ALGORITHMS, type AlgorithmInfo } from '@/constants/algorithms';
import { delay, getDelayFromSpeed } from '@/lib/animations';
import type { Bar, AnimationStep } from '@/types/canvas';

interface AlgorithmResult {
  steps: AnimationStep[];
  comparisons: number;
  swaps: number;
  timeElapsed: number;
}

interface UseAlgorithmsReturn {
  runAlgorithm: (algorithmId: string) => Promise<AlgorithmResult | null>;
  stopAlgorithm: () => void;
  pauseAlgorithm: () => void;
  resumeAlgorithm: () => void;
  stepForward: () => void;
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  comparisons: number;
  swaps: number;
  getAlgorithmInfo: (id: string) => AlgorithmInfo | undefined;
  getAllAlgorithms: () => AlgorithmInfo[];
}

export function useAlgorithms(): UseAlgorithmsReturn {
  const { animationSpeed, isPlaying, setPlaying, isPaused, setPaused } = useAppStore();
  const { bars, setBars } = useCanvasStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  
  const stopFlagRef = useRef(false);
  const pauseFlagRef = useRef(false);
  const stepsRef = useRef<AnimationStep[]>([]);

  // Get delay based on current speed setting
  const getDelay = useCallback(() => {
    return getDelayFromSpeed(animationSpeed);
  }, [animationSpeed]);

  // Check if should continue animation
  const shouldContinue = useCallback(() => {
    return !stopFlagRef.current && !pauseFlagRef.current;
  }, []);

  // Wait while paused
  const waitWhilePaused = useCallback(async () => {
    while (pauseFlagRef.current && !stopFlagRef.current) {
      await delay(100);
    }
  }, []);

  // Bubble Sort Algorithm
  const bubbleSort = useCallback(async (arr: Bar[]): Promise<AnimationStep[]> => {
    const steps: AnimationStep[] = [];
    const n = arr.length;
    let localComparisons = 0;
    let localSwaps = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!shouldContinue()) break;
        await waitWhilePaused();

        // Compare step
        steps.push({ type: 'compare', indices: [j, j + 1], message: `Comparing ${arr[j].value} and ${arr[j + 1].value}` });
        localComparisons++;
        setComparisons(localComparisons);

        if (arr[j].value > arr[j + 1].value) {
          // Swap step
          steps.push({ type: 'swap', indices: [j, j + 1], message: `Swapping ${arr[j].value} and ${arr[j + 1].value}` });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          localSwaps++;
          setSwaps(localSwaps);
        }

        setCurrentStep(steps.length);
        await delay(getDelay());
      }

      // Mark as sorted
      steps.push({ type: 'sorted', indices: [n - i - 1] });
    }

    // Mark first element as sorted
    steps.push({ type: 'sorted', indices: [0] });

    return steps;
  }, [getDelay, shouldContinue, waitWhilePaused]);

  // Selection Sort Algorithm
  const selectionSort = useCallback(async (arr: Bar[]): Promise<AnimationStep[]> => {
    const steps: AnimationStep[] = [];
    const n = arr.length;
    let localComparisons = 0;
    let localSwaps = 0;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < n; j++) {
        if (!shouldContinue()) break;
        await waitWhilePaused();

        steps.push({ type: 'compare', indices: [minIdx, j] });
        localComparisons++;
        setComparisons(localComparisons);

        if (arr[j].value < arr[minIdx].value) {
          minIdx = j;
        }

        setCurrentStep(steps.length);
        await delay(getDelay());
      }

      if (minIdx !== i) {
        steps.push({ type: 'swap', indices: [i, minIdx] });
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        localSwaps++;
        setSwaps(localSwaps);
      }

      steps.push({ type: 'sorted', indices: [i] });
    }

    steps.push({ type: 'sorted', indices: [n - 1] });

    return steps;
  }, [getDelay, shouldContinue, waitWhilePaused]);

  // Insertion Sort Algorithm
  const insertionSort = useCallback(async (arr: Bar[]): Promise<AnimationStep[]> => {
    const steps: AnimationStep[] = [];
    const n = arr.length;
    let localComparisons = 0;
    let localSwaps = 0;

    steps.push({ type: 'sorted', indices: [0] });

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j].value > key.value) {
        if (!shouldContinue()) break;
        await waitWhilePaused();

        steps.push({ type: 'compare', indices: [j, j + 1] });
        localComparisons++;
        setComparisons(localComparisons);

        steps.push({ type: 'swap', indices: [j, j + 1] });
        arr[j + 1] = arr[j];
        localSwaps++;
        setSwaps(localSwaps);

        j--;
        setCurrentStep(steps.length);
        await delay(getDelay());
      }

      arr[j + 1] = key;
      steps.push({ type: 'sorted', indices: [j + 1] });
    }

    return steps;
  }, [getDelay, shouldContinue, waitWhilePaused]);

  // Quick Sort Algorithm
    const quickSort = useCallback(async function quickSortInner(
      arr: Bar[],
      low: number,
      high: number,
      steps: AnimationStep[],
      stats: { comparisons: number; swaps: number }
    ): Promise<void> {
      if (low < high && shouldContinue()) {
        const pivot = arr[high].value;
        let i = low - 1;

        steps.push({ type: 'highlight', indices: [high], message: `Pivot: ${pivot}` });

        for (let j = low; j < high; j++) {
          if (!shouldContinue()) break;
          await waitWhilePaused();

          steps.push({ type: 'compare', indices: [j, high] });
          stats.comparisons++;
          setComparisons(stats.comparisons);

          if (arr[j].value < pivot) {
            i++;
            if (i !== j) {
              steps.push({ type: 'swap', indices: [i, j] });
              [arr[i], arr[j]] = [arr[j], arr[i]];
              stats.swaps++;
              setSwaps(stats.swaps);
            }
          }

          setCurrentStep(steps.length);
          await delay(getDelay());
        }

        // Place pivot in correct position
        steps.push({ type: 'swap', indices: [i + 1, high] });
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        stats.swaps++;
        setSwaps(stats.swaps);

        const pivotIndex = i + 1;
        steps.push({ type: 'sorted', indices: [pivotIndex] });

        await quickSortInner(arr, low, pivotIndex - 1, steps, stats);
        await quickSortInner(arr, pivotIndex + 1, high, steps, stats);
      }
    }, [getDelay, shouldContinue, waitWhilePaused]);

  // Run algorithm by ID
  const runAlgorithm = useCallback(async (algorithmId: string): Promise<AlgorithmResult | null> => {
    const algorithm = getAlgorithmById(algorithmId);
    if (!algorithm) return null;

    stopFlagRef.current = false;
    pauseFlagRef.current = false;
    setPlaying(true);
    setComparisons(0);
    setSwaps(0);
    setCurrentStep(0);

    const startTime = performance.now();
    const arrCopy = bars.map((bar, idx) => ({ ...bar, id: idx }));
    let steps: AnimationStep[] = [];

    switch (algorithmId) {
      case 'bubble-sort':
        steps = await bubbleSort(arrCopy);
        break;
      case 'selection-sort':
        steps = await selectionSort(arrCopy);
        break;
      case 'insertion-sort':
        steps = await insertionSort(arrCopy);
        break;
      case 'quick-sort':
        const stats = { comparisons: 0, swaps: 0 };
        await quickSort(arrCopy, 0, arrCopy.length - 1, steps, stats);
        break;
      default:
        console.warn(`Algorithm ${algorithmId} not implemented yet`);
        return null;
    }

    const timeElapsed = performance.now() - startTime;
    stepsRef.current = steps;
    setTotalSteps(steps.length);
    setPlaying(false);

    return {
      steps,
      comparisons,
      swaps,
      timeElapsed,
    };
  }, [bars, bubbleSort, selectionSort, insertionSort, quickSort, setPlaying, comparisons, swaps]);

  // Stop algorithm
  const stopAlgorithm = useCallback(() => {
    stopFlagRef.current = true;
    pauseFlagRef.current = false;
    setPlaying(false);
    setPaused(false);
  }, [setPlaying, setPaused]);

  // Pause algorithm
  const pauseAlgorithm = useCallback(() => {
    pauseFlagRef.current = true;
    setPaused(true);
  }, [setPaused]);

  // Resume algorithm
  const resumeAlgorithm = useCallback(() => {
    pauseFlagRef.current = false;
    setPaused(false);
  }, [setPaused]);

  // Step forward (for step-by-step mode)
  const stepForward = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  return {
    runAlgorithm,
    stopAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm,
    stepForward,
    isRunning: isPlaying,
    isPaused,
    currentStep,
    totalSteps,
    comparisons,
    swaps,
    getAlgorithmInfo: getAlgorithmById,
    getAllAlgorithms: () => ALL_ALGORITHMS,
  };
}
