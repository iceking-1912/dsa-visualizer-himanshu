# DSA Visualizer Terminal Architecture

## Overview

The terminal component is built on top of Xterm.js, providing a full-featured command-line interface for interacting with the DSA Visualizer.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Terminal Emulator                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Xterm.js                              ││
│  │  - Input handling                                        ││
│  │  - ANSI color rendering                                  ││
│  │  - Cursor management                                     ││
│  │  - Scrollback buffer                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      useTerminal Hook                        │
│  - Command execution orchestration                           │
│  - State management integration                              │
│  - Output formatting                                         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Command  │    │  Auto    │    │  Output  │
       │  Parser  │    │Completer │    │Formatter │
       └──────────┘    └──────────┘    └──────────┘
              │
              ▼
       ┌──────────────────────────────────────────┐
       │           Command Registry               │
       │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
       │  │  ls  │ │  cd  │ │ run  │ │ help │   │
       │  └──────┘ └──────┘ └──────┘ └──────┘   │
       │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
       │  │  cat │ │ find │ │ set  │ │ ... │   │
       │  └──────┘ └──────┘ └──────┘ └──────┘   │
       └──────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ Terminal │    │ Settings │    │   App    │
       │  Store   │    │  Store   │    │  Store   │
       └──────────┘    └──────────┘    └──────────┘
```

## Components

### 1. TerminalEmulator (`/src/components/terminal/TerminalEmulator.tsx`)

The main React component that wraps Xterm.js.

**Responsibilities:**
- Initialize and configure Xterm.js instance
- Handle keyboard input and special keys
- Manage input buffer and cursor position
- Integrate with useTerminal hook
- Handle terminal resize

**Features:**
- Custom dark/light themes
- Cursor blinking
- Selection support
- 1000 line scrollback buffer
- Copy/paste support

### 2. CommandParser (`/src/lib/cli-parser.ts`)

Parses raw input strings into structured command objects.

**Features:**
- Tokenization with quote handling
- Escape character support
- Pipe operator parsing
- Output redirection parsing
- Background execution detection
- Argument parsing (positional and options)

**Example:**
```typescript
// Input: run bubble-sort -s 5 --mode step
// Output:
{
  command: 'run',
  args: ['bubble-sort', '-s', '5', '--mode', 'step'],
  pipes: [],
  background: false,
  raw: 'run bubble-sort -s 5 --mode step'
}
```

### 3. CommandRegistry (`/src/lib/commands.ts`)

Central registry for all CLI commands.

**Features:**
- Command registration and lookup
- Alias support
- Command execution
- Built-in command implementations

**Command Structure:**
```typescript
interface CommandConfig {
  name: string;
  aliases: string[];
  description: string;
  syntax: string;
  options: CommandOption[];
  examples: string[];
  execute: (args, context) => Promise<CommandOutput>;
}
```

### 4. OutputFormatter (`/src/lib/output-formatter.ts`)

Formats terminal output with ANSI colors and styles.

**Features:**
- Color methods (success, error, warning, info)
- Table formatting
- Tree visualization
- Box drawing
- Progress bars
- Key-value formatting

### 5. AutoCompleter (`/src/lib/auto-completer.ts`)

Provides tab completion functionality.

**Features:**
- Command name completion
- Path/algorithm completion
- Option completion
- Suggestion display

### 6. useTerminal Hook (`/src/hooks/useTerminal.ts`)

React hook that connects the terminal UI to the application state.

**Features:**
- Command execution
- History management
- State synchronization
- Prompt generation

## State Management

### Terminal Store (`/src/stores/terminal.store.ts`)

```typescript
interface TerminalState {
  history: string[];        // Command history
  output: string;           // Current output buffer
  isLoading: boolean;       // Loading state
  currentPath: string[];    // Current directory path
  lastCommand: string;      // Last executed command
  historyIndex: number;     // History navigation index
}
```

### Settings Store (`/src/stores/settings.store.ts`)

```typescript
interface SettingsState {
  animationSpeed: 1-10;     // Animation speed
  animationMode: 'step' | 'continuous';
  theme: 'moonlight' | 'matrix';
  gridSize: number;
  showComplexity: boolean;
}
```

## Data Flow

1. **User Input** → TerminalEmulator captures keystrokes
2. **Input Processing** → Buffer management, special key handling
3. **Command Parsing** → CommandParser tokenizes and structures input
4. **Command Execution** → CommandRegistry finds and executes command
5. **State Updates** → Stores are updated based on command output
6. **Output Rendering** → OutputFormatter styles the response
7. **Display** → Xterm.js renders the formatted output

## Algorithm Data

Algorithm metadata is stored in `/src/data/algorithms.json`:

```json
{
  "sorting": {
    "bubble-sort": {
      "name": "Bubble Sort",
      "description": "...",
      "timeComplexity": {
        "best": "O(n)",
        "average": "O(n²)",
        "worst": "O(n²)"
      },
      "spaceComplexity": "O(1)",
      "stable": true,
      "code": "function bubbleSort(arr) { ... }",
      "categories": ["sorting", "comparison-based"]
    }
  }
}
```

## Keyboard Handling

| Key Code | Action |
|----------|--------|
| 9 (Tab) | Auto-complete |
| 13 (Enter) | Execute command |
| 127/8 (Backspace) | Delete character |
| 3 (Ctrl+C) | Cancel input |
| 12 (Ctrl+L) | Clear screen |
| 21 (Ctrl+U) | Clear line |
| 23 (Ctrl+W) | Delete word |
| Arrow Up | History previous |
| Arrow Down | History next |
| Arrow Left/Right | Cursor movement |

## Error Handling

The ErrorHandler class (`/src/lib/error-handler.ts`) provides:

- Command not found suggestions (Levenshtein distance)
- Invalid argument messages with usage hints
- Path not found with alternatives
- API error formatting
- Rate limiting messages

## Extensibility

### Adding New Commands

1. Create command configuration:
```typescript
this.register({
  name: 'mycommand',
  aliases: ['mc'],
  description: 'My custom command',
  syntax: 'mycommand [args]',
  options: [],
  examples: ['mycommand arg1'],
  execute: async (args, context) => {
    return { success: true, output: 'Done!' };
  },
});
```

2. Register in `registerBuiltInCommands()` method

### Custom Themes

Modify the theme objects in TerminalEmulator:
```typescript
const CUSTOM_THEME = {
  background: '#000000',
  foreground: '#ffffff',
  cursor: '#00ff00',
  // ... other colors
};
```

## Performance Considerations

- Input debouncing for rapid typing
- Lazy loading of terminal component (SSR disabled)
- Efficient history storage (max 100 entries)
- Scrollback buffer limit (1000 lines)
- Fit addon for responsive sizing
