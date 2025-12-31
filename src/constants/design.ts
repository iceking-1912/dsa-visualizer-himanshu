// Moonlight Hacker Theme - No gradients, flat design
export const design = {
  colors: {
    bg: '#0a0a0a',         // Deep black
    bgSecondary: '#1a1a1a',
    surface: '#252525',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    cyan: '#00d4ff',       // Primary accent
    pink: '#ff00ff',       // Secondary accent
    purple: '#aa00ff',     // Tertiary accent
    green: '#00ff88',      // Success
    red: '#ff4444',        // Error
    yellow: '#ffaa00',     // Warning
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  font: {
    mono: '"JetBrains Mono", "Fira Code", monospace',
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
    },
  },
  borderRadius: '4px',
  shadows: {
    sm: '0 2px 8px rgba(0,212,255,0.1)',
    md: '0 4px 16px rgba(0,212,255,0.15)',
  },
} as const;

export type DesignColors = keyof typeof design.colors;
export type DesignSpacing = keyof typeof design.spacing;
