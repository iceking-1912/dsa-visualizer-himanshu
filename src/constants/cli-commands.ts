// CLI Command constants and configurations

export const CLI_COMMANDS = {
  // Navigation commands
  ls: {
    name: 'ls',
    aliases: ['dir', 'list'],
    description: 'List contents of current directory',
    syntax: 'ls [path] [-l] [-a]',
    examples: ['ls', 'ls sorting', 'ls -l', 'ls -a'],
  },
  cd: {
    name: 'cd',
    aliases: ['chdir'],
    description: 'Change current directory',
    syntax: 'cd <path>',
    examples: ['cd sorting', 'cd ..', 'cd /'],
  },
  pwd: {
    name: 'pwd',
    aliases: [],
    description: 'Print current working directory',
    syntax: 'pwd',
    examples: ['pwd'],
  },

  // Algorithm commands
  run: {
    name: 'run',
    aliases: ['execute', 'start'],
    description: 'Run an algorithm visualization',
    syntax: 'run <algorithm> [-s size] [-d delay] [--step]',
    examples: ['run bubble-sort', 'run quick-sort -s 50', 'run merge-sort --step'],
  },
  stop: {
    name: 'stop',
    aliases: ['halt', 'pause'],
    description: 'Stop the current visualization',
    syntax: 'stop',
    examples: ['stop'],
  },
  reset: {
    name: 'reset',
    aliases: ['clear-canvas', 'restart'],
    description: 'Reset the visualization canvas',
    syntax: 'reset',
    examples: ['reset'],
  },
  info: {
    name: 'info',
    aliases: ['details', 'describe'],
    description: 'Show detailed information about an algorithm',
    syntax: 'info <algorithm>',
    examples: ['info bubble-sort', 'info quick-sort'],
  },

  // Settings commands
  set: {
    name: 'set',
    aliases: ['config'],
    description: 'Set a configuration option',
    syntax: 'set <option> <value>',
    examples: ['set speed 5', 'set size 100', 'set theme matrix'],
  },
  get: {
    name: 'get',
    aliases: ['show'],
    description: 'Get current value of a configuration option',
    syntax: 'get <option>',
    examples: ['get speed', 'get size', 'get theme'],
  },

  // Help commands
  help: {
    name: 'help',
    aliases: ['h', '?', 'man'],
    description: 'Show help information',
    syntax: 'help [command]',
    examples: ['help', 'help run', 'help set'],
  },
  about: {
    name: 'about',
    aliases: ['version'],
    description: 'Show information about DSA Visualizer',
    syntax: 'about',
    examples: ['about'],
  },

  // Utility commands
  clear: {
    name: 'clear',
    aliases: ['cls'],
    description: 'Clear the terminal screen',
    syntax: 'clear',
    examples: ['clear'],
  },
  history: {
    name: 'history',
    aliases: ['hist'],
    description: 'Show command history',
    syntax: 'history [-c]',
    examples: ['history', 'history -c'],
  },
  echo: {
    name: 'echo',
    aliases: ['print'],
    description: 'Print text to terminal',
    syntax: 'echo <text>',
    examples: ['echo Hello World', 'echo "multiple words"'],
  },
} as const;

export const COMMAND_CATEGORIES = {
  navigation: ['ls', 'cd', 'pwd'],
  algorithm: ['run', 'stop', 'reset', 'info'],
  settings: ['set', 'get'],
  help: ['help', 'about'],
  utility: ['clear', 'history', 'echo'],
} as const;

export const CLI_PROMPT_SYMBOL = '❯';
export const CLI_PATH_SEPARATOR = '/';
export const CLI_ROOT_PATH = 'dsa';

export const CLI_COLORS = {
  command: '#00d4ff',
  argument: '#a0a0a0',
  flag: '#ff00ff',
  error: '#ff4444',
  success: '#00ff88',
  warning: '#ffaa00',
  info: '#00d4ff',
  path: '#aa00ff',
  prompt: '#00d4ff',
} as const;

export type CommandName = keyof typeof CLI_COMMANDS;
export type CommandCategory = keyof typeof COMMAND_CATEGORIES;
