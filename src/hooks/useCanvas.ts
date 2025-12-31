'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Application, Graphics, Text, Container, TextStyle } from 'pixi.js';
import { useCanvasStore } from '@/stores/canvas.store';
import { useAppStore } from '@/stores/app.store';
import { design } from '@/constants/design';
import type { Bar } from '@/types/canvas';

interface UseCanvasOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const barsContainerRef = useRef<Container | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    bars,
    setBars,
    updateBar,
    setDimensions,
    setInitialized,
    resetBars,
  } = useCanvasStore();

  const { arraySize, animationSpeed } = useAppStore();

  // Initialize Pixi.js application
  const initCanvas = useCallback(async () => {
    if (!containerRef.current || appRef.current) return;

    const app = new Application();
    
    await app.init({
      width: options.width || containerRef.current.clientWidth,
      height: options.height || containerRef.current.clientHeight,
      backgroundColor: options.backgroundColor || design.colors.bg,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.canvas as HTMLCanvasElement);

    // Create bars container
    const barsContainer = new Container();
    barsContainer.label = 'bars';
    app.stage.addChild(barsContainer);

    appRef.current = app;
    barsContainerRef.current = barsContainer;

    setDimensions(app.screen.width, app.screen.height);
    setInitialized(true);
    setIsInitialized(true);

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        app.renderer.resize(width, height);
        setDimensions(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      app.destroy(true, { children: true, texture: true });
      appRef.current = null;
      barsContainerRef.current = null;
    };
  }, [options.width, options.height, options.backgroundColor, setDimensions, setInitialized]);

  // Generate random array
  const generateRandomArray = useCallback((size: number = arraySize): Bar[] => {
    if (!appRef.current) return [];

    const canvasWidth = appRef.current.screen.width;
    const canvasHeight = appRef.current.screen.height;
    const barGap = 2;
    const barWidth = Math.max(2, (canvasWidth - barGap * size) / size);
    const maxBarHeight = canvasHeight * 0.85;

    const newBars: Bar[] = [];
    for (let i = 0; i < size; i++) {
      const value = Math.floor(Math.random() * 100) + 1;
      const height = (value / 100) * maxBarHeight;

      newBars.push({
        id: i,
        value,
        x: i * (barWidth + barGap) + barGap,
        y: canvasHeight - height - 10,
        width: barWidth,
        height,
        color: design.colors.text,
        isComparing: false,
        isSwapping: false,
        isSorted: false,
      });
    }

    setBars(newBars);
    return newBars;
  }, [arraySize, setBars]);

  // Render bars to canvas
  const renderBars = useCallback((barsToRender: Bar[] = bars) => {
    if (!barsContainerRef.current) return;

    barsContainerRef.current.removeChildren();

    for (const bar of barsToRender) {
      const graphics = new Graphics();
      
      let color = bar.color;
      if (bar.isSorted) {
        color = design.colors.green;
      } else if (bar.isSwapping) {
        color = design.colors.pink;
      } else if (bar.isComparing) {
        color = design.colors.cyan;
      }

      graphics.rect(bar.x, bar.y, bar.width, bar.height);
      graphics.fill(color);
      
      barsContainerRef.current.addChild(graphics);
    }
  }, [bars]);

  // Highlight specific bars
  const highlightBars = useCallback((indices: number[], type: 'compare' | 'swap' | 'sorted') => {
    for (const index of indices) {
      const updates: Partial<Bar> = {
        isComparing: type === 'compare',
        isSwapping: type === 'swap',
        isSorted: type === 'sorted',
      };
      updateBar(index, updates);
    }
    renderBars();
  }, [updateBar, renderBars]);

  // Swap two bars
  const swapBars = useCallback((index1: number, index2: number) => {
    const currentBars = useCanvasStore.getState().bars;
    const newBars = [...currentBars];
    
    // Swap values and heights
    const temp = { value: newBars[index1].value, height: newBars[index1].height };
    newBars[index1] = {
      ...newBars[index1],
      value: newBars[index2].value,
      height: newBars[index2].height,
      y: appRef.current!.screen.height - newBars[index2].height - 10,
    };
    newBars[index2] = {
      ...newBars[index2],
      value: temp.value,
      height: temp.height,
      y: appRef.current!.screen.height - temp.height - 10,
    };

    setBars(newBars);
    renderBars(newBars);
  }, [setBars, renderBars]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (barsContainerRef.current) {
      barsContainerRef.current.removeChildren();
    }
    resetBars();
  }, [resetBars]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []);

  return {
    containerRef,
    appRef,
    isInitialized,
    bars,
    initCanvas,
    generateRandomArray,
    renderBars,
    highlightBars,
    swapBars,
    clearCanvas,
    updateBar,
  };
}
