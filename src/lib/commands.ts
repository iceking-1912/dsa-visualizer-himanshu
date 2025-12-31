import type { CommandConfig, CommandContext, CommandOutput, ParsedArgs } from '@/types/terminal';
import type { AlgorithmData, TreeNode } from '@/types/app';
import { outputFormatter } from './output-formatter';
import { findClosestMatch, kebabToTitle } from './utils';
import algorithmsData from '@/data/algorithms.json';

// Cast the imported JSON to proper type
const algorithms = algorithmsData as unknown as AlgorithmData;

/**
 * CommandRegistry - Manages all CLI commands
 */
class CommandRegistry {
  private commands: Map<string, CommandConfig> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.registerBuiltInCommands();
  }

  /**
   * Registers a command
   */
  register(config: CommandConfig): void {
    this.commands.set(config.name, config);
    for (const alias of config.aliases) {
      this.aliases.set(alias, config.name);
    }
  }

  /**
   * Gets a command by name or alias
   */
  get(name: string): CommandConfig | undefined {
    const commandName = this.aliases.get(name) || name;
    return this.commands.get(commandName);
  }

  /**
   * Gets all registered command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Executes a command
   */
  async execute(
    name: string,
    args: ParsedArgs,
    context: CommandContext
  ): Promise<CommandOutput> {
    const command = this.get(name);
    if (!command) {
      return this.commandNotFound(name);
    }
    return command.execute(args, context);
  }

  /**
   * Returns error output for unknown command
   */
  private commandNotFound(name: string): CommandOutput {
    const allNames = this.getCommandNames();
    const suggestion = findClosestMatch(name, allNames);
    
    let output = outputFormatter.error(`Command not found: ${name}`);
    if (suggestion) {
      output += `\r\n${outputFormatter.dim(`Did you mean '${suggestion}'?`)}`;
    }
    output += `\r\n${outputFormatter.dim("Type 'help' for available commands.")}`;
    
    return { success: false, output };
  }

  /**
   * Builds file tree from algorithm data
   */
  buildFileTree(): TreeNode {
    const root: TreeNode = {
      id: 'dsa',
      name: 'dsa',
      type: 'folder',
      path: ['dsa'],
      children: [],
    };

    for (const [category, algos] of Object.entries(algorithms)) {
      const categoryNode: TreeNode = {
        id: category,
        name: category,
        type: 'folder',
        path: ['dsa', category],
        children: [],
      };

      for (const [algoId, algoData] of Object.entries(algos)) {
        categoryNode.children!.push({
          id: algoId,
          name: algoData.name,
          type: 'file',
          path: ['dsa', category, algoId],
          metadata: algoData,
        });
      }

      root.children!.push(categoryNode);
    }

    return root;
  }

  /**
   * Gets algorithm by path
   */
  getAlgorithm(path: string[]): { category: string; id: string; data: AlgorithmData[string][string] } | null {
    if (path.length < 2) return null;
    
    // Handle paths like ['dsa', 'sorting', 'bubble-sort'] or ['sorting', 'bubble-sort']
    const startIdx = path[0] === 'dsa' ? 1 : 0;
    const category = path[startIdx];
    const algoId = path[startIdx + 1];

    if (category && algoId && algorithms[category]?.[algoId]) {
      return {
        category,
        id: algoId,
        data: algorithms[category][algoId],
      };
    }
    return null;
  }

  /**
   * Gets category content
   */
  getCategoryContent(category: string): string[] {
    if (algorithms[category]) {
      return Object.keys(algorithms[category]);
    }
    return [];
  }

  /**
   * Gets all categories
   */
  getCategories(): string[] {
    return Object.keys(algorithms);
  }

  /**
   * Registers all built-in commands
   */
  private registerBuiltInCommands(): void {
    // ===== ls command =====
    this.register({
      name: 'ls',
      aliases: ['list', 'dir'],
      description: 'List algorithms in current directory',
      syntax: 'ls [options] [path]',
      options: [
        { name: 'long', short: 'l', description: 'Long format with metadata', type: 'boolean' },
        { name: 'all', short: 'a', description: 'Show all including hidden', type: 'boolean' },
        { name: 'recursive', short: 'r', description: 'Show recursively', type: 'boolean' },
      ],
      examples: ['ls', 'ls -l', 'ls sorting', 'ls -l sorting'],
      execute: async (args, context): Promise<CommandOutput> => {
        const { positional, options } = args;
        const targetPath = positional[0];
        let currentPath = [...context.currentPath];

        // If a path is provided, navigate to it
        if (targetPath) {
          if (targetPath.startsWith('/') || targetPath.startsWith('~')) {
            currentPath = ['dsa'];
            const parts = targetPath.replace(/^[~\/]+/, '').split('/').filter(Boolean);
            if (parts[0] === 'dsa') parts.shift();
            currentPath.push(...parts);
          } else {
            currentPath.push(...targetPath.split('/').filter(Boolean));
          }
        }

        // Determine what to list
        const pathWithoutDsa = currentPath.filter((p) => p !== 'dsa');
        const items: { name: string; type: 'folder' | 'file'; metadata?: AlgorithmData[string][string] }[] = [];

        if (pathWithoutDsa.length === 0) {
          // Root - show categories
          for (const category of this.getCategories()) {
            items.push({ name: category, type: 'folder' });
          }
        } else if (pathWithoutDsa.length === 1) {
          // Category - show algorithms
          const category = pathWithoutDsa[0];
          const algos = this.getCategoryContent(category);
          if (algos.length === 0) {
            return {
              success: false,
              output: outputFormatter.error(`Directory not found: ${targetPath || currentPath.join('/')}`),
            };
          }
          for (const algoId of algos) {
            items.push({
              name: algoId,
              type: 'file',
              metadata: algorithms[category][algoId],
            });
          }
        } else {
          return {
            success: false,
            output: outputFormatter.error('Cannot list contents of a file'),
          };
        }

        // Format output
        let output = '';
        if (options.l || options.long) {
          // Long format
          const headers = ['Name', 'Type', 'Complexity'];
          const rows = items.map((item) => [
            item.type === 'folder' 
              ? outputFormatter.info(`📁 ${kebabToTitle(item.name)}/`)
              : `📄 ${kebabToTitle(item.name)}`,
            item.type,
            item.metadata?.timeComplexity?.average || '-',
          ]);
          output = outputFormatter.table(headers, rows);
        } else {
          // Short format
          const formatted = items.map((item) =>
            item.type === 'folder'
              ? outputFormatter.info(`${kebabToTitle(item.name)}/`)
              : kebabToTitle(item.name)
          );
          output = formatted.join('\r\n');
        }

        return { success: true, output: output || outputFormatter.dim('(empty)') };
      },
    });

    // ===== cd command =====
    this.register({
      name: 'cd',
      aliases: ['chdir'],
      description: 'Change current directory',
      syntax: 'cd [path]',
      options: [],
      examples: ['cd sorting', 'cd ..', 'cd /', 'cd sorting/bubble-sort'],
      execute: async (args, context): Promise<CommandOutput> => {
        const { positional } = args;
        const target = positional[0] || '';
        let newPath = [...context.currentPath];

        if (!target || target === '~' || target === '/') {
          newPath = ['dsa'];
        } else if (target === '..') {
          if (newPath.length > 1) {
            newPath.pop();
          }
        } else if (target === '-') {
          // Go to previous directory (simplified - just go to root)
          newPath = ['dsa'];
        } else if (target.startsWith('/') || target.startsWith('~')) {
          newPath = ['dsa'];
          const parts = target.replace(/^[~\/]+/, '').split('/').filter(Boolean);
          if (parts[0] === 'dsa') parts.shift();
          newPath.push(...parts);
        } else {
          const parts = target.split('/').filter(Boolean);
          for (const part of parts) {
            if (part === '..') {
              if (newPath.length > 1) newPath.pop();
            } else {
              newPath.push(part);
            }
          }
        }

        // Validate the path
        const pathWithoutDsa = newPath.filter((p) => p !== 'dsa');
        if (pathWithoutDsa.length === 0) {
          // Root is always valid
        } else if (pathWithoutDsa.length === 1) {
          // Check if category exists
          if (!this.getCategories().includes(pathWithoutDsa[0])) {
            return {
              success: false,
              output: outputFormatter.error(`Directory not found: ${target}`),
            };
          }
        } else if (pathWithoutDsa.length >= 2) {
          // Check if algorithm exists
          const algo = this.getAlgorithm(newPath);
          if (!algo) {
            return {
              success: false,
              output: outputFormatter.error(`Path not found: ${target}`),
            };
          }
        }

        return {
          success: true,
          output: '',
          updateState: { currentPath: newPath },
        };
      },
    });

    // ===== pwd command =====
    this.register({
      name: 'pwd',
      aliases: [],
      description: 'Print working directory',
      syntax: 'pwd',
      options: [],
      examples: ['pwd'],
      execute: async (args, context): Promise<CommandOutput> => {
        const pathStr = '~/' + context.currentPath.join('/');
        return { success: true, output: outputFormatter.info(pathStr) };
      },
    });

    // ===== cat command =====
    this.register({
      name: 'cat',
      aliases: ['show', 'view'],
      description: 'Display algorithm details',
      syntax: 'cat [algorithm]',
      options: [
        { name: 'code', short: 'c', description: 'Show code only', type: 'boolean' },
      ],
      examples: ['cat bubble-sort', 'cat -c quick-sort'],
      execute: async (args, context): Promise<CommandOutput> => {
        const { positional, options } = args;
        const target = positional[0];

        let algoPath = [...context.currentPath];
        if (target) {
          if (target.includes('/')) {
            algoPath = ['dsa', ...target.split('/').filter(Boolean)];
          } else {
            algoPath.push(target);
          }
        }

        const algo = this.getAlgorithm(algoPath);
        if (!algo) {
          return {
            success: false,
            output: outputFormatter.error(`Algorithm not found: ${target || 'current path'}`),
          };
        }

        const { data } = algo;

        if (options.c || options.code) {
          return {
            success: true,
            output: data.code || outputFormatter.dim('(no code available)'),
          };
        }

        // Full display
        const lines = [
          outputFormatter.box(data.name, ''),
          '',
          outputFormatter.dim(data.description),
          '',
          outputFormatter.complexity(
            data.timeComplexity.best,
            data.timeComplexity.average,
            data.timeComplexity.worst
          ),
          '',
          outputFormatter.keyValue('Space Complexity', data.spaceComplexity),
        ];

        if (data.stable !== undefined) {
          lines.push(outputFormatter.keyValue('Stable', data.stable ? outputFormatter.success('Yes') : outputFormatter.error('No')));
        }
        if (data.inPlace !== undefined) {
          lines.push(outputFormatter.keyValue('In-place', data.inPlace ? outputFormatter.success('Yes') : outputFormatter.error('No')));
        }

        return { success: true, output: lines.join('\r\n') };
      },
    });

    // ===== find command =====
    this.register({
      name: 'find',
      aliases: ['search', 'grep'],
      description: 'Search algorithms',
      syntax: 'find [query]',
      options: [
        { name: 'type', short: 't', description: 'Filter by type/category', type: 'string' },
      ],
      examples: ['find bubble', 'find -t sorting quick', 'find O(n)'],
      execute: async (args, _context): Promise<CommandOutput> => {
        const { positional, options } = args;
        const query = positional.join(' ').toLowerCase();
        const typeFilter = (options.type || options.t) as string | undefined;

        if (!query) {
          return {
            success: false,
            output: outputFormatter.error('Please provide a search query'),
          };
        }

        const results: { category: string; id: string; name: string }[] = [];

        for (const [category, algos] of Object.entries(algorithms)) {
          if (typeFilter && !category.toLowerCase().includes(typeFilter.toLowerCase())) {
            continue;
          }

          for (const [algoId, algoData] of Object.entries(algos)) {
            const searchText = `${algoData.name} ${algoData.description} ${algoData.categories.join(' ')} ${algoData.timeComplexity.average}`.toLowerCase();
            if (searchText.includes(query)) {
              results.push({ category, id: algoId, name: algoData.name });
            }
          }
        }

        if (results.length === 0) {
          return {
            success: true,
            output: outputFormatter.dim(`No algorithms found matching '${query}'`),
          };
        }

        const lines = [
          outputFormatter.success(`Found ${results.length} result(s):`),
          '',
          ...results.map((r) => `  ${outputFormatter.info(r.category)}/${r.name}`),
        ];

        return { success: true, output: lines.join('\r\n') };
      },
    });

    // ===== run command =====
    this.register({
      name: 'run',
      aliases: ['start', 'execute', 'exec'],
      description: 'Execute algorithm visualization',
      syntax: 'run [algorithm] [options]',
      options: [
        { name: 'speed', short: 's', description: 'Animation speed (1-10)', type: 'number', default: 5 },
        { name: 'mode', short: 'm', description: 'Mode (step/continuous)', type: 'string', default: 'continuous' },
        { name: 'size', short: 'n', description: 'Array size', type: 'number', default: 100 },
      ],
      examples: ['run bubble-sort', 'run -s 7 quick-sort', 'run merge-sort -m step'],
      execute: async (args, context): Promise<CommandOutput> => {
        const { positional, options } = args;
        const target = positional[0];

        let algoPath = [...context.currentPath];
        if (target) {
          if (target.includes('/')) {
            algoPath = ['dsa', ...target.split('/').filter(Boolean)];
          } else {
            // Check if it's an algorithm name in current category
            const pathWithoutDsa = context.currentPath.filter((p) => p !== 'dsa');
            if (pathWithoutDsa.length === 1) {
              algoPath.push(target);
            } else {
              // Try to find the algorithm in any category
              for (const category of this.getCategories()) {
                if (algorithms[category][target]) {
                  algoPath = ['dsa', category, target];
                  break;
                }
              }
            }
          }
        }

        const algo = this.getAlgorithm(algoPath);
        if (!algo) {
          return {
            success: false,
            output: outputFormatter.error(`Algorithm not found: ${target || 'none specified'}\r\n${outputFormatter.dim('Use "ls" to see available algorithms')}`),
          };
        }

        const speed = (options.speed || options.s || 5) as number;
        const mode = (options.mode || options.m || 'continuous') as string;
        const size = (options.size || options.n || 100) as number;

        const lines = [
          outputFormatter.success(`Starting visualization: ${algo.data.name}`),
          outputFormatter.keyValue('Speed', `${speed}/10`),
          outputFormatter.keyValue('Mode', mode),
          outputFormatter.keyValue('Array Size', size.toString()),
          '',
          outputFormatter.dim('(Visualization would start in the canvas area)'),
        ];

        return {
          success: true,
          output: lines.join('\r\n'),
          updateState: {
            activeAlgorithm: algo.id,
            isPlaying: true,
          },
        };
      },
    });

    // ===== stop command =====
    this.register({
      name: 'stop',
      aliases: ['halt', 'kill'],
      description: 'Stop current visualization',
      syntax: 'stop',
      options: [],
      examples: ['stop'],
      execute: async (): Promise<CommandOutput> => {
        return {
          success: true,
          output: outputFormatter.warning('Visualization stopped'),
          updateState: { isPlaying: false },
        };
      },
    });

    // ===== pause command =====
    this.register({
      name: 'pause',
      aliases: [],
      description: 'Pause current visualization',
      syntax: 'pause',
      options: [],
      examples: ['pause'],
      execute: async (): Promise<CommandOutput> => {
        return {
          success: true,
          output: outputFormatter.warning('Visualization paused'),
        };
      },
    });

    // ===== resume command =====
    this.register({
      name: 'resume',
      aliases: ['continue'],
      description: 'Resume paused visualization',
      syntax: 'resume',
      options: [],
      examples: ['resume'],
      execute: async (): Promise<CommandOutput> => {
        return {
          success: true,
          output: outputFormatter.success('Visualization resumed'),
        };
      },
    });

    // ===== step command =====
    this.register({
      name: 'step',
      aliases: ['next'],
      description: 'Step through visualization',
      syntax: 'step [count]',
      options: [],
      examples: ['step', 'step 5'],
      execute: async (args): Promise<CommandOutput> => {
        const count = parseInt(args.positional[0]) || 1;
        return {
          success: true,
          output: outputFormatter.info(`Stepped forward ${count} step(s)`),
        };
      },
    });

    // ===== set command =====
    this.register({
      name: 'set',
      aliases: [],
      description: 'Configure settings',
      syntax: 'set [setting] [value]',
      options: [],
      examples: ['set speed 7', 'set theme dark', 'set mode step'],
      execute: async (args, context): Promise<CommandOutput> => {
        const { positional } = args;
        const [setting, value] = positional;

        if (!setting) {
          return {
            success: false,
            output: outputFormatter.error('Usage: set <setting> <value>\r\n' +
              outputFormatter.dim('Available settings: speed, mode, theme, gridSize, showComplexity')),
          };
        }

        const validSettings = ['speed', 'mode', 'theme', 'gridSize', 'showComplexity'];
        if (!validSettings.includes(setting)) {
          return {
            success: false,
            output: outputFormatter.error(`Unknown setting: ${setting}\r\n` +
              outputFormatter.dim(`Available: ${validSettings.join(', ')}`)),
          };
        }

        if (!value) {
          // Show current value
          const currentValue = context.settings[setting as keyof typeof context.settings];
          return {
            success: true,
            output: outputFormatter.keyValue(setting, String(currentValue)),
          };
        }

        return {
          success: true,
          output: outputFormatter.success(`Set ${setting} = ${value}`),
        };
      },
    });

    // ===== get command =====
    this.register({
      name: 'get',
      aliases: [],
      description: 'Display current setting value',
      syntax: 'get [setting|all]',
      options: [],
      examples: ['get speed', 'get all'],
      execute: async (args, context): Promise<CommandOutput> => {
        const setting = args.positional[0];

        if (!setting || setting === 'all') {
          const lines = Object.entries(context.settings).map(
            ([key, value]) => outputFormatter.keyValue(key, String(value))
          );
          return { success: true, output: lines.join('\r\n') };
        }

        const value = context.settings[setting as keyof typeof context.settings];
        if (value === undefined) {
          return {
            success: false,
            output: outputFormatter.error(`Unknown setting: ${setting}`),
          };
        }

        return {
          success: true,
          output: outputFormatter.keyValue(setting, String(value)),
        };
      },
    });

    // ===== config command =====
    this.register({
      name: 'config',
      aliases: ['settings'],
      description: 'Show all configuration',
      syntax: 'config',
      options: [],
      examples: ['config'],
      execute: async (args, context): Promise<CommandOutput> => {
        const lines = [
          outputFormatter.bold('Current Configuration'),
          outputFormatter.divider(),
          ...Object.entries(context.settings).map(
            ([key, value]) => `  ${outputFormatter.info(key)}: ${value}`
          ),
        ];
        return { success: true, output: lines.join('\r\n') };
      },
    });

    // ===== help command =====
    this.register({
      name: 'help',
      aliases: ['?', 'man'],
      description: 'Display help information',
      syntax: 'help [command]',
      options: [],
      examples: ['help', 'help ls', 'help run'],
      execute: async (args): Promise<CommandOutput> => {
        const commandName = args.positional[0];

        if (commandName) {
          const cmd = this.get(commandName);
          if (!cmd) {
            return {
              success: false,
              output: outputFormatter.error(`Unknown command: ${commandName}`),
            };
          }

          const lines = [
            outputFormatter.bold(cmd.name) + outputFormatter.dim(` - ${cmd.description}`),
            '',
            outputFormatter.info('SYNTAX:'),
            `  ${cmd.syntax}`,
          ];

          if (cmd.aliases.length > 0) {
            lines.push('', outputFormatter.info('ALIASES:'), `  ${cmd.aliases.join(', ')}`);
          }

          if (cmd.options.length > 0) {
            lines.push('', outputFormatter.info('OPTIONS:'));
            for (const opt of cmd.options) {
              const shortPart = opt.short ? `-${opt.short}, ` : '    ';
              lines.push(`  ${shortPart}--${opt.name.padEnd(12)} ${opt.description}`);
            }
          }

          if (cmd.examples.length > 0) {
            lines.push('', outputFormatter.info('EXAMPLES:'));
            for (const ex of cmd.examples) {
              lines.push(`  ${outputFormatter.dim('$')} ${ex}`);
            }
          }

          return { success: true, output: lines.join('\r\n') };
        }

        // Show all commands
        const lines = [
          outputFormatter.bold('DSA Visualizer CLI - Available Commands'),
          outputFormatter.divider(),
          '',
        ];

        const categories = {
          'Navigation & Files': ['ls', 'cd', 'pwd', 'cat', 'find'],
          'Visualization': ['run', 'stop', 'pause', 'resume', 'step'],
          'Configuration': ['set', 'get', 'config'],
          'System': ['help', 'clear', 'history', 'alias', 'export'],
        };

        for (const [category, cmdNames] of Object.entries(categories)) {
          lines.push(outputFormatter.info(category + ':'));
          for (const name of cmdNames) {
            const cmd = this.get(name);
            if (cmd) {
              lines.push(`  ${outputFormatter.success(name.padEnd(12))} ${outputFormatter.dim(cmd.description)}`);
            }
          }
          lines.push('');
        }

        lines.push(outputFormatter.dim("Type 'help <command>' for detailed usage."));

        return { success: true, output: lines.join('\r\n') };
      },
    });

    // ===== clear command =====
    this.register({
      name: 'clear',
      aliases: ['cls', 'reset'],
      description: 'Clear terminal screen',
      syntax: 'clear',
      options: [],
      examples: ['clear'],
      execute: async (): Promise<CommandOutput> => {
        return {
          success: true,
          output: '\x1b[2J\x1b[H', // ANSI clear screen
        };
      },
    });

    // ===== history command =====
    this.register({
      name: 'history',
      aliases: ['hist'],
      description: 'Show command history',
      syntax: 'history [count]',
      options: [],
      examples: ['history', 'history 10'],
      execute: async (_args): Promise<CommandOutput> => {
        // History is handled by the terminal, this is a placeholder
        return {
          success: true,
          output: outputFormatter.dim('(History managed by terminal)'),
        };
      },
    });

    // ===== alias command =====
    this.register({
      name: 'alias',
      aliases: [],
      description: 'Create command shortcuts',
      syntax: "alias [name] '[command]'",
      options: [],
      examples: ["alias qs 'run quick-sort'", "alias bs 'run bubble-sort -s 7'"],
      execute: async (args): Promise<CommandOutput> => {
        const { positional } = args;
        const [name, ...commandParts] = positional;
        const command = commandParts.join(' ');

        if (!name) {
          // List existing aliases
          const aliasEntries = Array.from(this.aliases.entries())
            .filter(([alias]) => !this.commands.has(alias))
            .map(([alias, cmd]) => `${outputFormatter.info(alias)} = ${cmd}`);

          if (aliasEntries.length === 0) {
            return { success: true, output: outputFormatter.dim('No aliases defined') };
          }

          return { success: true, output: aliasEntries.join('\r\n') };
        }

        if (!command) {
          return {
            success: false,
            output: outputFormatter.error("Usage: alias <name> '<command>'"),
          };
        }

        // Store alias (simplified - just log it)
        return {
          success: true,
          output: outputFormatter.success(`Created alias: ${name} = '${command}'`),
        };
      },
    });

    // ===== export command =====
    this.register({
      name: 'export',
      aliases: [],
      description: 'Export session data',
      syntax: 'export [format]',
      options: [],
      examples: ['export json', 'export csv'],
      execute: async (args): Promise<CommandOutput> => {
        const format = args.positional[0] || 'json';
        const validFormats = ['json', 'csv', 'txt'];

        if (!validFormats.includes(format)) {
          return {
            success: false,
            output: outputFormatter.error(`Invalid format: ${format}\r\n${outputFormatter.dim(`Supported: ${validFormats.join(', ')}`)}`),
          };
        }

        return {
          success: true,
          output: outputFormatter.success(`Exporting session data as ${format}...`) + '\r\n' +
            outputFormatter.dim('(Export functionality would save to file)'),
        };
      },
    });

    // ===== tree command (bonus) =====
    this.register({
      name: 'tree',
      aliases: [],
      description: 'Display algorithm tree',
      syntax: 'tree [path]',
      options: [],
      examples: ['tree', 'tree sorting'],
      execute: async (_args, _context): Promise<CommandOutput> => {
        const fileTree = this.buildFileTree();
        return {
          success: true,
          output: outputFormatter.tree(fileTree),
        };
      },
    });

    // ===== echo command (bonus) =====
    this.register({
      name: 'echo',
      aliases: ['print'],
      description: 'Print text to terminal',
      syntax: 'echo [text]',
      options: [],
      examples: ['echo Hello World', 'echo "Quoted text"'],
      execute: async (args): Promise<CommandOutput> => {
        return {
          success: true,
          output: args.positional.join(' '),
        };
      },
    });
  }
}

export const commandRegistry = new CommandRegistry();
