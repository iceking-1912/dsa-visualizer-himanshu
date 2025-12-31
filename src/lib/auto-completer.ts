import type { CommandContext, Suggestion } from '@/types/terminal';
import { commandRegistry } from './commands';
import type { AlgorithmData } from '@/types/app';
import algorithmsData from '@/data/algorithms.json';

const algorithms = algorithmsData as unknown as AlgorithmData;

/**
 * AutoCompleter - Provides tab completion for the CLI
 */
export class AutoCompleter {
  /**
   * Gets completion suggestions for the current input
   */
  getSuggestions(input: string, context: CommandContext): Suggestion[] {
    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    const suggestions: Suggestion[] = [];

    if (parts.length <= 1) {
      // Completing a command name
      const prefix = parts[0]?.toLowerCase() || '';
      const commandNames = commandRegistry.getCommandNames();

      for (const name of commandNames) {
        if (name.startsWith(prefix)) {
          const cmd = commandRegistry.get(name);
          suggestions.push({
            text: name,
            type: 'command',
            description: cmd?.description || '',
            icon: '⌘',
          });
        }
      }
    } else {
      // Completing arguments
      const command = parts[0].toLowerCase();
      const lastPart = parts[parts.length - 1];
      const isOption = lastPart.startsWith('-');

      if (isOption) {
        // Complete options
        const cmd = commandRegistry.get(command);
        if (cmd) {
          for (const opt of cmd.options) {
            const longOpt = `--${opt.name}`;
            const shortOpt = opt.short ? `-${opt.short}` : '';
            
            if (longOpt.startsWith(lastPart)) {
              suggestions.push({
                text: longOpt,
                type: 'option',
                description: opt.description,
                icon: '⚙',
              });
            }
            if (shortOpt && shortOpt.startsWith(lastPart)) {
              suggestions.push({
                text: shortOpt,
                type: 'option',
                description: opt.description,
                icon: '⚙',
              });
            }
          }
        }
      } else {
        // Complete file paths/algorithms
        const pathSuggestions = this.getPathSuggestions(lastPart, context);
        suggestions.push(...pathSuggestions);
      }
    }

    return suggestions.slice(0, 10); // Limit suggestions
  }

  /**
   * Gets path-based suggestions for algorithm names and categories
   */
  private getPathSuggestions(prefix: string, context: CommandContext): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const lowerPrefix = prefix.toLowerCase();
    const currentPathWithoutDsa = context.currentPath.filter((p) => p !== 'dsa');

    if (currentPathWithoutDsa.length === 0) {
      // At root - suggest categories
      for (const category of Object.keys(algorithms)) {
        if (category.toLowerCase().startsWith(lowerPrefix)) {
          suggestions.push({
            text: category,
            type: 'file',
            description: `${Object.keys(algorithms[category]).length} algorithms`,
            icon: '📁',
          });
        }
      }
    } else if (currentPathWithoutDsa.length === 1) {
      // In a category - suggest algorithms
      const category = currentPathWithoutDsa[0];
      const algos = algorithms[category];
      if (algos) {
        for (const [algoId, algoData] of Object.entries(algos)) {
          if (algoId.toLowerCase().startsWith(lowerPrefix)) {
            suggestions.push({
              text: algoId,
              type: 'file',
              description: algoData.name,
              icon: '📄',
            });
          }
        }
      }
    }

    // Also suggest algorithms by name match
    for (const [category, algos] of Object.entries(algorithms)) {
      for (const [algoId, algoData] of Object.entries(algos)) {
        if (
          algoId.toLowerCase().startsWith(lowerPrefix) &&
          !suggestions.some((s) => s.text === algoId)
        ) {
          suggestions.push({
            text: algoId,
            type: 'file',
            description: `${algoData.name} (${category})`,
            icon: '📄',
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Completes the input with the given suggestion
   */
  complete(input: string, suggestion: Suggestion): string {
    const parts = input.trim().split(/\s+/);
    
    if (parts.length <= 1) {
      return suggestion.text + ' ';
    }

    parts[parts.length - 1] = suggestion.text;
    return parts.join(' ') + ' ';
  }

  /**
   * Formats suggestions list for display
   */
  formatSuggestionList(suggestions: Suggestion[]): string {
    if (suggestions.length === 0) return '';

    return suggestions
      .map((s) => `  ${s.icon} ${s.text.padEnd(20)} ${s.description}`)
      .join('\r\n');
  }
}

export const autoCompleter = new AutoCompleter();
