'use client';

import { useCallback } from 'react';
import { useTerminalStore } from '@/stores/terminal.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useAppStore } from '@/stores/app.store';
import { commandParser } from '@/lib/cli-parser';
import { commandRegistry } from '@/lib/commands';
import { outputFormatter } from '@/lib/output-formatter';
import type { CommandContext } from '@/types/terminal';

export interface UseTerminalReturn {
  output: string;
  isLoading: boolean;
  currentPath: string[];
  history: string[];
  executeCommand: (command: string) => Promise<void>;
  clearTerminal: () => void;
  getHistory: () => string[];
  navigateHistory: (direction: 'up' | 'down') => string;
  getPrompt: () => string;
}

export function useTerminal(): UseTerminalReturn {
  const {
    output,
    isLoading,
    currentPath,
    history,
    addHistory,
    appendOutput,
    clearOutput,
    setLoading,
    setCurrentPath,
    navigateHistory,
  } = useTerminalStore();

  const settings = useSettingsStore();
  const appStore = useAppStore();

  const getPrompt = useCallback(() => {
    return outputFormatter.commandPrompt(currentPath);
  }, [currentPath]);

  const executeCommand = useCallback(
    async (input: string): Promise<void> => {
      const trimmedInput = input.trim();
      
      // Echo the command
      appendOutput(getPrompt() + trimmedInput + '\r\n');

      if (!trimmedInput) {
        return;
      }

      // Add to history
      addHistory(trimmedInput);

      // Parse the command
      const parsed = commandParser.parse(trimmedInput);
      const validation = commandParser.validate(parsed);

      if (!validation.valid) {
        appendOutput(outputFormatter.error(validation.error || 'Invalid command') + '\r\n');
        return;
      }

      // Check for special clear command
      if (parsed.command === 'clear' || parsed.command === 'cls') {
        clearOutput();
        return;
      }

      // Build context
      const context: CommandContext = {
        currentPath,
        settings: {
          animationSpeed: settings.animationSpeed,
          animationMode: settings.animationMode,
          theme: settings.theme,
          gridSize: settings.gridSize,
          showComplexity: settings.showComplexity,
        },
        algorithmData: {},
        fileTree: commandRegistry.buildFileTree(),
      };

      // Parse arguments
      const args = commandParser.parseArgs(parsed.args);

      setLoading(true);

      try {
        const result = await commandRegistry.execute(parsed.command, args, context);

        if (result.output) {
          appendOutput(result.output + '\r\n');
        }

        // Apply state updates
        if (result.updateState) {
          if (result.updateState.currentPath) {
            setCurrentPath(result.updateState.currentPath);
          }
          if (result.updateState.activeAlgorithm) {
            appStore.setActiveAlgorithm(result.updateState.activeAlgorithm);
          }
          if (result.updateState.isPlaying !== undefined) {
            appStore.setPlaying(result.updateState.isPlaying);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        appendOutput(outputFormatter.error(`Error: ${errorMessage}`) + '\r\n');
      } finally {
        setLoading(false);
      }
    },
    [
      currentPath,
      settings,
      addHistory,
      appendOutput,
      clearOutput,
      setLoading,
      setCurrentPath,
      getPrompt,
      appStore,
    ]
  );

  const clearTerminal = useCallback(() => {
    clearOutput();
  }, [clearOutput]);

  const getHistoryFn = useCallback(() => {
    return history;
  }, [history]);

  return {
    output,
    isLoading,
    currentPath,
    history,
    executeCommand,
    clearTerminal,
    getHistory: getHistoryFn,
    navigateHistory,
    getPrompt,
  };
}
