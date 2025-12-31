import type { ParsedCommand, ValidationResult } from '@/types/terminal';

/**
 * CommandParser - Parses user input into structured command objects
 */
export class CommandParser {
  /**
   * Tokenizes input string, respecting quotes and escape characters
   */
  tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }

      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }

      if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Parses input string into a ParsedCommand object
   */
  parse(input: string): ParsedCommand {
    const trimmed = input.trim();
    
    if (!trimmed) {
      return {
        command: '',
        args: [],
        pipes: [],
        background: false,
        raw: input,
      };
    }

    // Check for background execution
    const background = trimmed.endsWith('&');
    const cleanedInput = background ? trimmed.slice(0, -1).trim() : trimmed;

    // Split by pipes
    const pipeSegments = this.splitByPipes(cleanedInput);
    const firstSegment = pipeSegments[0];
    const pipes = pipeSegments.slice(1);

    // Check for output redirection
    let redirect: ParsedCommand['redirect'];
    let segmentForParsing = firstSegment;

    const redirectMatch = firstSegment.match(/\s*(>>?)\s*(\S+)\s*$/);
    if (redirectMatch) {
      redirect = {
        type: redirectMatch[1] as '>' | '>>',
        target: redirectMatch[2],
      };
      segmentForParsing = firstSegment.slice(0, redirectMatch.index).trim();
    }

    // Tokenize the command and arguments
    const tokens = this.tokenize(segmentForParsing);
    const command = tokens[0]?.toLowerCase() || '';
    const args = tokens.slice(1);

    return {
      command,
      args,
      pipes,
      redirect,
      background,
      raw: input,
    };
  }

  /**
   * Splits input by pipe operators, respecting quotes
   */
  private splitByPipes(input: string): string[] {
    const segments: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
        continue;
      }

      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
        continue;
      }

      if (char === '|' && !inQuotes) {
        segments.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      segments.push(current.trim());
    }

    return segments;
  }

  /**
   * Validates a parsed command
   */
  validate(command: ParsedCommand): ValidationResult {
    if (!command.command) {
      return { valid: false, error: 'No command provided' };
    }

    // Check for invalid characters
    if (/[<>|&;]/.test(command.command)) {
      return {
        valid: false,
        error: 'Invalid characters in command name',
      };
    }

    return { valid: true };
  }

  /**
   * Parses arguments into positional args and options
   */
  parseArgs(args: string[]): { positional: string[]; options: Record<string, string | boolean | number> } {
    const positional: string[] = [];
    const options: Record<string, string | boolean | number> = {};
    
    let i = 0;
    while (i < args.length) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        // Long option: --option=value or --option value or --flag
        const [key, ...valueParts] = arg.slice(2).split('=');
        if (valueParts.length > 0) {
          options[key] = this.parseValue(valueParts.join('='));
        } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          options[key] = this.parseValue(args[++i]);
        } else {
          options[key] = true;
        }
      } else if (arg.startsWith('-') && arg.length > 1) {
        // Short option: -o value or -abc (multiple flags)
        const flags = arg.slice(1);
        if (flags.length === 1) {
          if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
            options[flags] = this.parseValue(args[++i]);
          } else {
            options[flags] = true;
          }
        } else {
          // Multiple flags: -abc
          for (const flag of flags) {
            options[flag] = true;
          }
        }
      } else {
        positional.push(arg);
      }
      i++;
    }

    return { positional, options };
  }

  /**
   * Parses a value string into appropriate type
   */
  private parseValue(value: string): string | number | boolean {
    if (value === 'true') return true;
    if (value === 'false') return false;
    const num = Number(value);
    if (!isNaN(num) && value !== '') return num;
    return value;
  }
}

export const commandParser = new CommandParser();
