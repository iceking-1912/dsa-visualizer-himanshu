'use client';

import { useEffect, useRef, useState } from 'react';
import { getCanvasCommandExecutor, resetCanvasCommandExecutor } from '@/lib/canvas/CanvasCommandExecutor';
import type { ExecutionResult, AlgorithmState } from '@/lib/canvas/AlgorithmEngine';
import { getAlgorithmEngine } from '@/lib/canvas/AlgorithmEngine';
import { useAppStore } from '@/stores/app.store';
import StatsOverlay from './StatsOverlay';

interface CanvasRendererProps {
  algorithmName?: string;
  isRunning?: boolean;
  mode?: 'step' | 'continuous';
  onExecutionComplete?: (result: ExecutionResult) => void;
  inputArray?: number[];
  showStats?: boolean;
}

export default function CanvasRenderer({
  algorithmName,
  isRunning = false,
  mode = 'continuous',
  onExecutionComplete,
  inputArray,
  showStats = true,
}: CanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentState, setCurrentState] = useState<Partial<AlgorithmState>>({
    isRunning: false,
    isPaused: false,
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0,
    algorithmName: '',
  });
  const executorRef = useRef<ReturnType<typeof getCanvasCommandExecutor> | null>(null);
  const { arraySize, animationSpeed } = useAppStore();

  // Initialize canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get a fresh executor instance
    const executor = getCanvasCommandExecutor();
    executorRef.current = executor;
    let isCancelled = false;
    let initTimeout: ReturnType<typeof setTimeout> | null = null;

    const waitForDimensions = (): Promise<void> => {
      return new Promise((resolve) => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          resolve();
          return;
        }
        // Wait for container to have dimensions
        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
              observer.disconnect();
              resolve();
              return;
            }
          }
        });
        observer.observe(container);
        // Timeout fallback after 500ms
        initTimeout = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 500);
      });
    };

    const initCanvas = async () => {
      try {
        await waitForDimensions();
        if (isCancelled) return;
        await executor.initialize(container);
        if (isCancelled) return;
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize canvas:', error);
      }
    };

    initCanvas();

    // Cleanup
    return () => {
      isCancelled = true;
      if (initTimeout) clearTimeout(initTimeout);
      // Only reset if this is still the current executor
      if (executorRef.current === executor) {
        resetCanvasCommandExecutor();
        executorRef.current = null;
      }
    };
  }, []);

  // Handle state changes
  useEffect(() => {
    const executor = executorRef.current;
    if (!executor) return;

    executor.setOnStateChange((state) => {
      const engine = getAlgorithmEngine();
      const fullState = engine.getState();
      setCurrentState({
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        algorithmName: state.currentAlgorithm || '',
        comparisons: fullState.comparisons,
        swaps: fullState.swaps,
        timeElapsed: fullState.timeElapsed,
        progress: fullState.progress,
      });
    });

    executor.setOnComplete((result) => {
      if (onExecutionComplete) {
        onExecutionComplete(result);
      }
    });
  }, [onExecutionComplete, isInitialized]);

  // Handle speed changes
  useEffect(() => {
    const executor = executorRef.current;
    if (!executor) return;
    executor.setSpeed(animationSpeed);
  }, [animationSpeed, isInitialized]);

  // Handle algorithm execution
  useEffect(() => {
    if (!isInitialized || !algorithmName || !isRunning) return;

    const executor = executorRef.current;
    if (!executor) return;

    executor.executeRun(algorithmName, {
      speed: animationSpeed,
      mode,
      inputArray,
      inputSize: arraySize,
    }).catch((error) => {
      console.error('Algorithm execution error:', error);
    });
  }, [isInitialized, algorithmName, isRunning, animationSpeed, mode, inputArray, arraySize]);

  // Regenerate visualization when size changes after init
  useEffect(() => {
    if (!isInitialized) return;
    const executor = executorRef.current;
    if (!executor) return;
    
    // Use a small delay to ensure the canvas is fully ready after init
    const timeoutId = setTimeout(() => {
      try {
        executor.generateArray(arraySize);
      } catch (error) {
        console.warn('Failed to generate array:', error);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [arraySize, isInitialized]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0a]">
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Stats overlay */}
      {showStats && currentState.isRunning && (
        <StatsOverlay
          algorithmName={currentState.algorithmName || ''}
          arraySize={arraySize}
          comparisons={currentState.comparisons || 0}
          swaps={currentState.swaps || 0}
          timeElapsed={currentState.timeElapsed || 0}
          isPaused={currentState.isPaused || false}
          speed={animationSpeed}
          progress={currentState.progress || 0}
        />
      )}

      {/* Initial placeholder */}
      {!currentState.isRunning && isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 opacity-50">
            <p className="text-[#a0a0a0] text-sm">
              Use the terminal to run an algorithm
            </p>
            <div className="flex gap-2 justify-center text-xs">
              <code className="px-2 py-1 bg-[#252525] rounded border border-[#00d4ff]/20">
                run bubble-sort
              </code>
              <code className="px-2 py-1 bg-[#252525] rounded border border-[#00d4ff]/20">
                run quick-sort -s 7
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[#00d4ff] animate-pulse">
            Initializing canvas...
          </div>
        </div>
      )}
    </div>
  );
}
