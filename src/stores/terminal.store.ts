import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TerminalState } from '@/types/terminal';

interface TerminalStore extends TerminalState {
  addHistory: (cmd: string) => void;
  appendOutput: (output: string) => void;
  setOutput: (output: string) => void;
  clearOutput: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentPath: (path: string[]) => void;
  setLastCommand: (cmd: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string;
  resetHistoryIndex: () => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 100;

const initialState: TerminalState = {
  history: [],
  output: '',
  isLoading: false,
  currentPath: ['dsa'],
  lastCommand: '',
  historyIndex: -1,
};

export const useTerminalStore = create<TerminalStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      addHistory: (cmd: string) => {
        const { history } = get();
        // Don't add duplicates consecutively
        if (history[history.length - 1] === cmd) return;
        const newHistory = [...history, cmd].slice(-MAX_HISTORY);
        set({ history: newHistory, historyIndex: -1 });
      },
      appendOutput: (output: string) => set((state) => ({ output: state.output + output })),
      setOutput: (output: string) => set({ output }),
      clearOutput: () => set({ output: '' }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setCurrentPath: (currentPath: string[]) => set({ currentPath }),
      setLastCommand: (lastCommand: string) => set({ lastCommand }),
      navigateHistory: (direction: 'up' | 'down') => {
        const { history, historyIndex } = get();
        if (history.length === 0) return '';

        let newIndex: number;
        if (direction === 'up') {
          newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        } else {
          newIndex = historyIndex === -1 ? -1 : Math.min(history.length - 1, historyIndex + 1);
          if (historyIndex === history.length - 1) {
            set({ historyIndex: -1 });
            return '';
          }
        }

        set({ historyIndex: newIndex });
        return history[newIndex] || '';
      },
      resetHistoryIndex: () => set({ historyIndex: -1 }),
      clearHistory: () => set({ history: [], historyIndex: -1 }),
    }),
    {
      name: 'dsa-visualizer-terminal',
      partialize: (state) => ({
        history: state.history,
        currentPath: state.currentPath,
      }),
    }
  )
);
