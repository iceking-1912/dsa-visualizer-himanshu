import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, AnimationSpeed, Theme } from '@/types/app';

interface AppStore extends AppState {
  setActiveAlgorithm: (algo: string) => void;
  setArraySize: (size: number) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setTheme: (theme: Theme) => void;
  reset: () => void;
}

const initialState: AppState = {
  activeAlgorithm: 'bubble-sort',
  arraySize: 100,
  animationSpeed: 5,
  theme: 'moonlight',
  isPlaying: false,
  isPaused: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setActiveAlgorithm: (algo: string) => set({ activeAlgorithm: algo }),
      setArraySize: (size: number) => set({ arraySize: Math.max(10, Math.min(500, size)) }),
      setAnimationSpeed: (speed: AnimationSpeed) => set({ animationSpeed: speed }),
      togglePlay: () => set({ isPlaying: !get().isPlaying }),
      setPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setPaused: (isPaused: boolean) => set({ isPaused }),
      setTheme: (theme: Theme) => set({ theme }),
      reset: () => set(initialState),
    }),
    {
      name: 'dsa-visualizer-app',
    }
  )
);
