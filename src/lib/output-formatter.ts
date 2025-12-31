import type { TreeNode } from '@/types/app';

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Bright foreground colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

/**
 * OutputFormatter - Formats terminal output with colors and styles
 */
export class OutputFormatter {
  // Color methods
  success(text: string): string {
    return `${COLORS.brightGreen}${text}${COLORS.reset}`;
  }

  error(text: string): string {
    return `${COLORS.brightRed}${text}${COLORS.reset}`;
  }

  warning(text: string): string {
    return `${COLORS.brightYellow}${text}${COLORS.reset}`;
  }

  info(text: string): string {
    return `${COLORS.brightCyan}${text}${COLORS.reset}`;
  }

  accent(text: string): string {
    return `${COLORS.brightMagenta}${text}${COLORS.reset}`;
  }

  dim(text: string): string {
    return `${COLORS.dim}${text}${COLORS.reset}`;
  }

  bold(text: string): string {
    return `${COLORS.bold}${text}${COLORS.reset}`;
  }

  // Formatting methods
  commandPrompt(path: string[]): string {
    const pathStr = path.length > 0 ? '~/' + path.join('/') : '~';
    return `${COLORS.brightCyan}${pathStr}${COLORS.reset}${COLORS.dim}>${COLORS.reset} `;
  }

  /**
   * Creates a formatted table
   */
  table(headers: string[], rows: string[][]): string {
    if (rows.length === 0) return '';

    // Calculate column widths
    const colWidths = headers.map((h, i) => {
      const maxRowWidth = Math.max(...rows.map((r) => (r[i] || '').length));
      return Math.max(h.length, maxRowWidth);
    });

    // Build table
    const lines: string[] = [];
    
    // Header
    const headerLine = headers
      .map((h, i) => h.padEnd(colWidths[i]))
      .join('  ');
    lines.push(`${COLORS.bold}${headerLine}${COLORS.reset}`);
    
    // Separator
    const separator = colWidths.map((w) => '─'.repeat(w)).join('──');
    lines.push(`${COLORS.dim}${separator}${COLORS.reset}`);
    
    // Rows
    for (const row of rows) {
      const rowLine = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join('  ');
      lines.push(rowLine);
    }

    return lines.join('\r\n');
  }

  /**
   * Creates a tree visualization
   */
  tree(node: TreeNode, prefix = '', isLast = true): string {
    const lines: string[] = [];
    const connector = isLast ? '└── ' : '├── ';
    const icon = node.type === 'folder' ? '📁 ' : '📄 ';
    
    lines.push(`${prefix}${connector}${icon}${this.info(node.name)}`);
    
    if (node.children && node.children.length > 0) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      node.children.forEach((child, index) => {
        const childIsLast = index === node.children!.length - 1;
        lines.push(this.tree(child, newPrefix, childIsLast));
      });
    }
    
    return lines.join('\r\n');
  }

  /**
   * Creates a box around text
   */
  box(title: string, content: string): string {
    const lines = content.split('\n');
    const maxWidth = Math.max(title.length, ...lines.map((l) => l.length)) + 4;
    
    const top = `${COLORS.cyan}╔${'═'.repeat(maxWidth)}╗${COLORS.reset}`;
    const titleLine = `${COLORS.cyan}║${COLORS.reset} ${COLORS.bold}${title.padEnd(maxWidth - 2)}${COLORS.reset} ${COLORS.cyan}║${COLORS.reset}`;
    const separator = `${COLORS.cyan}╠${'═'.repeat(maxWidth)}╣${COLORS.reset}`;
    const bottom = `${COLORS.cyan}╚${'═'.repeat(maxWidth)}╝${COLORS.reset}`;
    
    const contentLines = lines.map(
      (l) => `${COLORS.cyan}║${COLORS.reset} ${l.padEnd(maxWidth - 2)} ${COLORS.cyan}║${COLORS.reset}`
    );
    
    return [top, titleLine, separator, ...contentLines, bottom].join('\r\n');
  }

  /**
   * Creates a simple divider
   */
  divider(char = '─', length = 40): string {
    return `${COLORS.dim}${char.repeat(length)}${COLORS.reset}`;
  }

  /**
   * Creates a progress bar
   */
  progressBar(current: number, total: number, width = 30): string {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const bar = `${COLORS.brightCyan}${'█'.repeat(filled)}${COLORS.dim}${'░'.repeat(empty)}${COLORS.reset}`;
    return `[${bar}] ${percentage.toFixed(0)}%`;
  }

  /**
   * Formats a key-value pair
   */
  keyValue(key: string, value: string): string {
    return `${COLORS.dim}${key}:${COLORS.reset} ${value}`;
  }

  /**
   * Formats complexity information
   */
  complexity(best: string, average: string, worst: string): string {
    return [
      `${COLORS.dim}Time Complexity:${COLORS.reset}`,
      `  ${this.success('Best:')}    ${best}`,
      `  ${this.warning('Average:')} ${average}`,
      `  ${this.error('Worst:')}   ${worst}`,
    ].join('\r\n');
  }

  /**
   * Creates a newline
   */
  newline(): string {
    return '\r\n';
  }

  /**
   * Wraps text with colors stripped for length calculation
   */
  stripColors(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }
}

export const outputFormatter = new OutputFormatter();
