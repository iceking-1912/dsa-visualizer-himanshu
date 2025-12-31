import { create } from 'zustand';
import type { CanvasState, Bar } from '@/types/canvas';

interface CanvasStore extends CanvasState {
  setDimensions: (width: number, height: number) => void;
  setInitialized: (initialized: boolean) => void;
  setCurrentAnimation: (animation: string | null) => void;
  setAnimationFrame: (frame: number) => void;
  setBars: (bars: Bar[]) => void;
  updateBar: (id: number, updates: Partial<Bar>) => void;
  resetBars: () => void;
}

const initialState: CanvasState = {
  width: 800,
  height: 600,
  isInitialized: false,
  currentAnimation: null,
  animationFrame: 0,
  bars: [],
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...initialState,
  setDimensions: (width: number, height: number) => set({ width, height }),
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setCurrentAnimation: (currentAnimation: string | null) => set({ currentAnimation }),
  setAnimationFrame: (animationFrame: number) => set({ animationFrame }),
  setBars: (bars: Bar[]) => set({ bars }),
  updateBar: (id: number, updates: Partial<Bar>) =>
    set({
      bars: get().bars.map((bar) => (bar.id === id ? { ...bar, ...updates } : bar)),
    }),
  resetBars: () => set({ bars: [], animationFrame: 0, currentAnimation: null }),
}));
