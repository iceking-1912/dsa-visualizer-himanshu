'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useTerminal } from '@/hooks/useTerminal';
import { autoCompleter } from '@/lib/auto-completer';
import { outputFormatter } from '@/lib/output-formatter';
import { useTerminalStore } from '@/stores/terminal.store';
import { useSettingsStore } from '@/stores/settings.store';
import type { CommandContext } from '@/types/terminal';
import { commandRegistry } from '@/lib/commands';

import 'xterm/css/xterm.css';

interface TerminalEmulatorProps {
  height?: string;
  theme?: 'dark' | 'light';
  onCommand?: (cmd: string) => void;
}

const DARK_THEME = {
  background: '#0a0e27',
  foreground: '#e0e0e0',
  cursor: '#00d4ff',
  cursorAccent: '#0a0e27',
  selectionBackground: '#00d4ff33',
  black: '#0a0a0a',
  red: '#ff4444',
  green: '#00ff88',
  yellow: '#ffaa00',
  blue: '#00d4ff',
  magenta: '#ff00ff',
  cyan: '#00d4ff',
  white: '#e0e0e0',
  brightBlack: '#666666',
  brightRed: '#ff6b6b',
  brightGreen: '#5fff5f',
  brightYellow: '#ffff5f',
  brightBlue: '#5fd7ff',
  brightMagenta: '#ff5fff',
  brightCyan: '#5fffff',
  brightWhite: '#ffffff',
};

const LIGHT_THEME = {
  background: '#f5f5f5',
  foreground: '#1a1a1a',
  cursor: '#0066cc',
  cursorAccent: '#f5f5f5',
  selectionBackground: '#0066cc33',
  black: '#1a1a1a',
  red: '#cc0000',
  green: '#00aa00',
  yellow: '#aa5500',
  blue: '#0066cc',
  magenta: '#aa00aa',
  cyan: '#00aaaa',
  white: '#cccccc',
  brightBlack: '#555555',
  brightRed: '#ff0000',
  brightGreen: '#00ff00',
  brightYellow: '#ffff00',
  brightBlue: '#0088ff',
  brightMagenta: '#ff00ff',
  brightCyan: '#00ffff',
  brightWhite: '#ffffff',
};

export default function TerminalEmulator({
  height = '100%',
  theme = 'dark',
  onCommand,
}: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef<string>('');
  const cursorPositionRef = useRef<number>(0);
  const outputLengthRef = useRef<number>(0);
  const awaitingPromptRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { executeCommand, currentPath, navigateHistory } = useTerminal();
  const terminalStore = useTerminalStore();
  const settings = useSettingsStore();

  // Get current prompt
  const getPrompt = useCallback(() => {
    return outputFormatter.commandPrompt(currentPath);
  }, [currentPath]);

  // Write prompt to terminal
  const writePrompt = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.write(getPrompt());
    }
  }, [getPrompt]);

  // Refresh the current line
  const refreshLine = useCallback(() => {
    if (!xtermRef.current) return;
    const term = xtermRef.current;
    
    // Clear current line and rewrite
    term.write('\r\x1b[K'); // Carriage return and clear line
    term.write(getPrompt() + inputBufferRef.current);
    
    // Position cursor correctly
    const cursorOffset = inputBufferRef.current.length - cursorPositionRef.current;
    if (cursorOffset > 0) {
      term.write(`\x1b[${cursorOffset}D`); // Move cursor left
    }
  }, [getPrompt]);

  // Handle command execution
  const handleExecute = useCallback(async () => {
    if (!xtermRef.current) return;
    
    const command = inputBufferRef.current;
    inputBufferRef.current = '';
    cursorPositionRef.current = 0;
    
    xtermRef.current.write('\r\n');
    
    awaitingPromptRef.current = true;

    if (command.trim()) {
      await executeCommand(command);
      onCommand?.(command);
    } else {
      // Trigger loading cycle for empty input so the prompt returns
      await executeCommand(command);
    }
  }, [executeCommand, onCommand]);

  // Handle tab completion
  const handleTabCompletion = useCallback(() => {
    if (!xtermRef.current) return;

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

    const suggestions = autoCompleter.getSuggestions(inputBufferRef.current, context);

    if (suggestions.length === 0) {
      return;
    }

    if (suggestions.length === 1) {
      // Auto-complete with single suggestion
      inputBufferRef.current = autoCompleter.complete(inputBufferRef.current, suggestions[0]);
      cursorPositionRef.current = inputBufferRef.current.length;
      refreshLine();
    } else {
      // Show suggestions
      xtermRef.current.write('\r\n');
      xtermRef.current.write(autoCompleter.formatSuggestionList(suggestions));
      xtermRef.current.write('\r\n');
      writePrompt();
      xtermRef.current.write(inputBufferRef.current);
    }
  }, [currentPath, settings, refreshLine, writePrompt]);

  // Handle history navigation
  const handleHistoryNavigation = useCallback((direction: 'up' | 'down') => {
    const historyCommand = navigateHistory(direction);
    inputBufferRef.current = historyCommand;
    cursorPositionRef.current = historyCommand.length;
    refreshLine();
  }, [navigateHistory, refreshLine]);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const container = terminalRef.current;
    let term: XTerm | null = null;
    let fitAddon: FitAddon | null = null;
    let fitTimer: ReturnType<typeof setTimeout> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let handleResize: (() => void) | null = null;
    let isCleanedUp = false;

    const safeFit = () => {
      if (isCleanedUp || !term || !term.element) return;
      // Check if the terminal's internal buffer and renderer are ready
      // @ts-expect-error - accessing internal property to check readiness
      if (!term._core?._renderService?._renderer) return;
      try {
        if (container && container.clientWidth > 0 && container.clientHeight > 0 && fitAddon) {
          fitAddon.fit();
        }
      } catch (err) {
        // Silently ignore fit errors
      }
    };

    // Wait for container to have dimensions before initializing
    const initTerminal = () => {
      if (isCleanedUp) return;
      
      if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
        // Container not ready yet, try again after a short delay
        retryTimer = setTimeout(initTerminal, 50);
        return;
      }

      term = new XTerm({
        theme: theme === 'dark' ? DARK_THEME : LIGHT_THEME,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 14,
        lineHeight: 1.5,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
        allowProposedApi: true,
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      try {
        term.open(container);
      } catch (err) {
        console.warn('Terminal open failed, will retry:', err);
        term.dispose();
        term = null;
        fitAddon = null;
        // Retry after a delay
        retryTimer = setTimeout(initTerminal, 100);
        return;
      }

      // Defer fit until terminal is fully initialized
      fitTimer = setTimeout(safeFit, 50);
      rafIdRef.current = requestAnimationFrame(() => {
        setTimeout(safeFit, 100);
      });

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Welcome message
      term.writeln('\x1b[96m╔══════════════════════════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[96m║\x1b[0m  \x1b[1m\x1b[95mDSA Visualizer\x1b[0m - Interactive Algorithm Visualization   \x1b[96m║\x1b[0m');
      term.writeln('\x1b[96m╚══════════════════════════════════════════════════════════╝\x1b[0m');
      term.writeln('');
      term.writeln("\x1b[2mType 'help' for available commands or 'ls' to list algorithms.\x1b[0m");
      term.writeln('');

      // Write initial prompt
      term.write(getPrompt());

      // Capture term for closure
      const currentTerm = term;

      // Handle input
      currentTerm.onData((data) => {
        const code = data.charCodeAt(0);

        // Handle special keys
        if (data === '\x1b[A') {
          // Up arrow - history
          handleHistoryNavigation('up');
          return;
        }
        if (data === '\x1b[B') {
          // Down arrow - history
          handleHistoryNavigation('down');
          return;
        }
        if (data === '\x1b[C') {
          // Right arrow
          if (cursorPositionRef.current < inputBufferRef.current.length) {
            cursorPositionRef.current++;
            currentTerm.write(data);
          }
          return;
        }
        if (data === '\x1b[D') {
          // Left arrow
          if (cursorPositionRef.current > 0) {
            cursorPositionRef.current--;
            currentTerm.write(data);
          }
          return;
        }
        if (data === '\x1b[3~') {
          // Delete key
          if (cursorPositionRef.current < inputBufferRef.current.length) {
            inputBufferRef.current =
              inputBufferRef.current.slice(0, cursorPositionRef.current) +
              inputBufferRef.current.slice(cursorPositionRef.current + 1);
            refreshLine();
          }
          return;
        }

        // Tab - auto-complete
        if (code === 9) {
          handleTabCompletion();
          return;
        }

        // Enter - execute
        if (code === 13) {
          handleExecute();
          return;
        }

        // Backspace
        if (code === 127 || code === 8) {
          if (cursorPositionRef.current > 0) {
            inputBufferRef.current =
              inputBufferRef.current.slice(0, cursorPositionRef.current - 1) +
              inputBufferRef.current.slice(cursorPositionRef.current);
            cursorPositionRef.current--;
            refreshLine();
          }
          return;
        }

        // Ctrl+C - cancel
        if (code === 3) {
          inputBufferRef.current = '';
          cursorPositionRef.current = 0;
          currentTerm.write('^C\r\n');
          writePrompt();
          return;
        }

        // Ctrl+L - clear
        if (code === 12) {
          currentTerm.clear();
          writePrompt();
          currentTerm.write(inputBufferRef.current);
          return;
        }

        // Ctrl+U - clear line
        if (code === 21) {
          inputBufferRef.current = '';
          cursorPositionRef.current = 0;
          refreshLine();
          return;
        }

        // Ctrl+W - delete word
        if (code === 23) {
          const beforeCursor = inputBufferRef.current.slice(0, cursorPositionRef.current);
          const afterCursor = inputBufferRef.current.slice(cursorPositionRef.current);
          const newBefore = beforeCursor.replace(/\S+\s*$/, '');
          inputBufferRef.current = newBefore + afterCursor;
          cursorPositionRef.current = newBefore.length;
          refreshLine();
          return;
        }

        // Regular character input
        if (code >= 32 && code < 127) {
          inputBufferRef.current =
            inputBufferRef.current.slice(0, cursorPositionRef.current) +
            data +
            inputBufferRef.current.slice(cursorPositionRef.current);
          cursorPositionRef.current++;
          refreshLine();
        }
      });

      // Handle resize
      handleResize = () => {
        safeFit();
      };

      window.addEventListener('resize', handleResize);

      // Mark as ready after a microtask to avoid sync setState in effect
      Promise.resolve().then(() => setIsReady(true));
    };

    // Start initialization
    initTerminal();

    return () => {
      isCleanedUp = true;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (fitTimer) {
        clearTimeout(fitTimer);
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (term) {
        term.dispose();
      }
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update terminal when output changes from hooks
  useEffect(() => {
    if (!xtermRef.current || !isReady) return;

    const output = terminalStore.output;

    // Reset when output is cleared
    if (output.length < outputLengthRef.current) {
      xtermRef.current.clear();
      outputLengthRef.current = 0;
    }

    const diff = output.slice(outputLengthRef.current);
    if (diff) {
      xtermRef.current.write(diff);
      outputLengthRef.current = output.length;
    }
  }, [terminalStore.output, isReady]);

  useEffect(() => {
    if (!xtermRef.current || !isReady) return;

    if (!terminalStore.isLoading && awaitingPromptRef.current) {
      writePrompt();
      awaitingPromptRef.current = false;
    }
  }, [terminalStore.isLoading, isReady, writePrompt]);

  // Update prompt when path changes
  useEffect(() => {
    // We don't need to do anything here since prompt is written after each command
  }, [currentPath]);

  // Handle resize on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full overflow-hidden"
      style={{ height }}
    />
  );
}
