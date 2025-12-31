// Terminal-specific type definitions

export interface ParsedCommand {
  command: string;
  args: string[];
  pipes: string[];
  redirect?: {
    type: '>' | '>>';
    target: string;
  };
  background: boolean;
  raw: string;
}

export interface ParsedArgs {
  positional: string[];
  options: Record<string, string | boolean | number>;
}

export interface CommandOption {
  name: string;
  short?: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
  default?: string | number | boolean;
}

export interface CommandConfig {
  name: string;
  aliases: string[];
  description: string;
  syntax: string;
  options: CommandOption[];
  examples: string[];
  execute: (args: ParsedArgs, context: CommandContext) => Promise<CommandOutput>;
}

export interface CommandOutput {
  success: boolean;
  output: string;
  data?: unknown;
  updateState?: Partial<{
    currentPath: string[];
    activeAlgorithm: string;
    isPlaying: boolean;
  }>;
}

export interface CommandContext {
  currentPath: string[];
  settings: SettingsState;
  algorithmData: import('./app').AlgorithmData;
  fileTree: import('./app').TreeNode;
}

export interface SettingsState {
  animationSpeed: import('./app').AnimationSpeed;
  animationMode: import('./app').AnimationMode;
  theme: import('./app').Theme;
  gridSize: number;
  showComplexity: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}

export interface Suggestion {
  text: string;
  type: 'command' | 'file' | 'option';
  description: string;
  icon: string;
}

export interface TerminalState {
  history: string[];
  output: string;
  isLoading: boolean;
  currentPath: string[];
  lastCommand: string;
  historyIndex: number;
}
