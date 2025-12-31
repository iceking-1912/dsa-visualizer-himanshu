'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTerminalStore } from '@/stores/terminal.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useAppStore } from '@/stores/app.store';
import { useExplorerStore } from '@/stores/explorer.store';
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
  const setExplorerPath = useExplorerStore(state => state.setCurrentPath);
  const expandNode = useExplorerStore(state => state.expandNode);
  
  // Track last synced path to prevent infinite loops
  const lastSyncedPathRef = useRef<string>('');

  // Sync terminal path with file explorer (one-way: terminal -> explorer)
  useEffect(() => {
    // Convert terminal path (e.g., ['dsa', 'sorting']) to explorer path format
    const terminalPathWithoutDsa = currentPath.filter(p => p !== 'dsa');
    const pathKey = JSON.stringify(terminalPathWithoutDsa);
    
    // Only update if paths are actually different to prevent infinite loops
    if (pathKey !== lastSyncedPathRef.current) {
      lastSyncedPathRef.current = pathKey;
      setExplorerPath(terminalPathWithoutDsa);
      
      // Expand nodes in path
      terminalPathWithoutDsa.forEach(segment => {
        expandNode(segment);
      });
    }
  }, [currentPath, setExplorerPath, expandNode]);

  const getPrompt = useCallback(() => {
    return outputFormatter.commandPrompt(currentPath);
  }, [currentPath]);

  const executeCommand = useCallback(
    async (input: string): Promise<void> => {
      const trimmedInput = input.trim();
      setLoading(true);

      if (!trimmedInput) {
        // Empty command still needs to release the loading flag
        setLoading(false);
        return;
      }

      // Add to history
      addHistory(trimmedInput);

      // Parse the command
      const parsed = commandParser.parse(trimmedInput);
      const validation = commandParser.validate(parsed);

      if (!validation.valid) {
        appendOutput(outputFormatter.error(validation.error || 'Invalid command') + '\r\n');
        setLoading(false);
        return;
      }

      // Check for special clear command
      if (parsed.command === 'clear' || parsed.command === 'cls') {
        clearOutput();
        setLoading(false);
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
