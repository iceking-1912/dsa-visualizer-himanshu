import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState } from '@/types/terminal';

interface SettingsStore extends SettingsState {
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}

const initialSettings: SettingsState = {
  animationSpeed: 5,
  animationMode: 'continuous',
  theme: 'moonlight',
  gridSize: 100,
  showComplexity: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
        set({ [key]: value } as Partial<SettingsState>),
      resetSettings: () => set(initialSettings),
    }),
    {
      name: 'dsa-visualizer-settings',
    }
  )
);
