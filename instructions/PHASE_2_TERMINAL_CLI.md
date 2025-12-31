# DSA Visualizer - Phase 2: Terminal UI & CLI Command System

## Phase Overview
**Duration**: 2-3 days  
**Objective**: Build complete terminal emulator with full CLI command system, including file navigation, settings, and algorithm execution commands  
**Deliverable**: Fully functional terminal UI with 15+ commands working seamlessly  
**GitHub Commits**: 2 (terminal implementation + CLI commands completion)


do this installation in curerent folder where you want the project to be created that is root of this repo 
---

## 🎯 Core Objectives

1. Implement Xterm.js terminal emulator with proper styling
2. Build complete CLI command parser with validation
3. Create 15+ core commands (ls, cd, cat, pwd, run, stop, set, help, etc.)
4. Integrate terminal with file explorer state management
5. Implement command history with navigation (up/down arrows)
6. Add auto-completion for commands and file paths
7. Create proper output formatting and logging system
8. Build settings management via CLI

---

## 📋 Detailed Requirements

### 1. Terminal Emulator Component

**TerminalEmulator.tsx** - Main component:

```typescript
// Requirements:
// - Initialize Xterm.js with proper theme and styling
// - Support minimum 80x24 terminal size (configurable)
// - Implement proper input/output handling
// - Support ANSI color codes for output
// - Enable copy/paste functionality
// - Implement proper scrollback buffer (1000+ lines)
// - Handle window resize events
// - Maintain blinking cursor state

interface TerminalProps {
  height?: string;
  theme?: 'dark' | 'light';
  onCommand?: (cmd: string) => void;
  initialOutput?: string;
}

const TerminalEmulator: React.FC<TerminalProps> = ({
  height = '400px',
  theme = 'dark',
  onCommand,
  initialOutput
}) => {
  // Implementation
};
```

**Terminal Styling (Terminal.module.css):**
- Black background: #0a0e27
- Text color: #e0e0e0
- Accent for commands: #00d9ff (cyan)
- Error text: #ff0040 (red)
- Success text: #00ff00 (green)
- Proper font: JetBrains Mono, Fira Code
- Font size: 14px
- Line height: 1.5

### 2. CLI Command Parser Architecture

**CommandParser.ts** - Core parser logic:

```typescript
// Requirements:
// - Parse user input into tokens
// - Support pipes (|) for command chaining
// - Support output redirection (>, >>)
// - Support background execution (&)
// - Validate command syntax before execution
// - Provide detailed error messages
// - Support quoted strings with spaces
// - Handle escape characters

interface ParsedCommand {
  command: string;
  args: string[];
  pipes: string[];
  redirect?: {
    type: '>' | '>>',
    target: string
  };
  background: boolean;
}

class CommandParser {
  parse(input: string): ParsedCommand;
  validate(command: ParsedCommand): ValidationResult;
  tokenize(input: string): string[];
}
```

### 3. Core Commands Implementation

**Commands to implement (15+ total):**

#### Navigation & File Commands:
1. **ls** - List algorithms
   - Usage: `ls` or `ls [path]` or `ls sorting`
   - Options: `-l` (long format), `-r` (recursive), `-a` (show all)
   - Output: Formatted list with metadata
   - Example: `ls -l sorting`

2. **cd** - Change directory (algorithm)
   - Usage: `cd [algorithm]` or `cd ..` or `cd /`
   - Validate path exists
   - Update file explorer state
   - Example: `cd sorting/bubble-sort`

3. **pwd** - Print working directory
   - Show current algorithm path
   - Example output: `/dsa/sorting/bubble-sort`

4. **cat** - Display algorithm details/code
   - Usage: `cat [algorithm]`
   - Show: Name, description, code, complexity
   - Syntax highlighting (optional)
   - Example: `cat bubble-sort`

5. **find** - Search algorithms
   - Usage: `find [query]` or `find -type [type] [query]`
   - Search by name, complexity, category
   - Example: `find -type sorting quick`

#### Execution & Visualization:
6. **run** - Execute algorithm visualization
   - Usage: `run [algorithm]` or `run` (current)
   - Options: `-speed [1-10]`, `-mode [step/continuous]`, `-input [data]`
   - Example: `run bubble-sort -speed 5`

7. **stop** - Stop current visualization
   - Halt animation
   - Reset canvas

8. **step** - Step through visualization
   - One step at a time (for step mode)
   - Show current state

9. **pause** - Pause animation
   - Resume with `resume` command

10. **resume** - Resume paused animation

#### Settings & Configuration:
11. **set** - Configure settings
    - Usage: `set [setting] [value]`
    - Settings: speed, mode, theme, gridSize, animationStyle
    - Example: `set speed 7` or `set theme dark`

12. **get** - Display current setting value
    - Usage: `get [setting]` or `get all`

13. **config** - Show all configuration
    - Display all current settings

#### System Commands:
14. **help** - Display help
    - Usage: `help` or `help [command]`
    - Show all commands or specific command details
    - Include examples

15. **clear** - Clear terminal screen
    - Clear output buffer
    - Keep history

16. **history** - Show command history
    - Usage: `history` or `history [count]`
    - Example: `history 10` (last 10 commands)

17. **alias** - Create command shortcuts
    - Usage: `alias [name] [command]`
    - Example: `alias qsort 'run quick-sort'`

18. **export** - Export session data
    - Usage: `export [format]`
    - Formats: json, csv, txt

### 4. Command Interface & Execution

**commands.ts** - Command registry:

```typescript
interface CommandConfig {
  name: string;
  aliases: string[];
  description: string;
  syntax: string;
  options: {
    name: string;
    short?: string;
    description: string;
    type: 'string' | 'number' | 'boolean';
    default?: any;
  }[];
  examples: string[];
  execute: (args: ParsedArgs, context: CommandContext) => Promise<CommandOutput>;
}

interface CommandOutput {
  success: boolean;
  output: string;
  data?: any;
  updateState?: Partial<AppState>;
}

interface CommandContext {
  currentPath: string[];
  settings: Settings;
  algorithmData: AlgorithmData;
  fileTree: TreeNode;
}

const commandRegistry: Map<string, CommandConfig> = new Map();
```

### 5. Output Formatting System

**OutputFormatter.ts** - Format terminal output:

```typescript
// Requirements:
// - ANSI color codes support
// - Table formatting
// - Tree visualization
// - Code syntax highlighting
// - Progress indicators
// - Error highlighting

class OutputFormatter {
  // Color methods
  success(text: string): string;      // Green
  error(text: string): string;        // Red
  warning(text: string): string;      // Yellow
  info(text: string): string;         // Cyan
  accent(text: string): string;       // Magenta
  
  // Formatting methods
  table(data: any[][]): string;
  tree(root: TreeNode, options?: TreeOptions): string;
  code(content: string, language?: string): string;
  blockQuote(text: string): string;
  divider(): string;
  
  // Special formatting
  commandPrompt(path: string): string;  // '~/dsa/sorting> '
  progressBar(current: number, total: number): string;
}
```

### 6. Command History & Navigation

**CommandHistory.ts**:

```typescript
class CommandHistory {
  // Requirements:
  // - Store last 100 commands
  // - Navigate with arrow keys (up/down)
  // - Search history with Ctrl+R
  // - Clear history command
  // - Save/load history from localStorage

  push(command: string): void;
  getPrevious(): string | null;
  getNext(): string | null;
  search(query: string): string[];
  clear(): void;
  save(): void;
  load(): void;
}
```

### 7. Auto-Completion System

**AutoCompleter.ts**:

```typescript
// Requirements:
// - Tab key completion
// - Suggest commands
// - Suggest file paths
// - Suggest options
// - Cycle through suggestions
// - Show suggestion list

class AutoCompleter {
  getSuggestions(input: string, context: CommandContext): Suggestion[];
  complete(input: string, suggestion: Suggestion): string;
  formatSuggestionList(suggestions: Suggestion[]): string;
}

interface Suggestion {
  text: string;
  type: 'command' | 'file' | 'option';
  description: string;
  icon: string;
}
```

### 8. Algorithm Details Data Structure

Create comprehensive algorithm metadata:

```json
// data/algorithms.json
{
  "sorting": {
    "bubble-sort": {
      "name": "Bubble Sort",
      "description": "Simple sorting algorithm that repeatedly steps through the list...",
      "timeComplexity": {
        "best": "O(n)",
        "average": "O(n²)",
        "worst": "O(n²)"
      },
      "spaceComplexity": "O(1)",
      "stable": true,
      "inPlace": true,
      "adaptive": true,
      "code": "function bubbleSort(arr) { ... }",
      "visualization": {
        "arraySize": 100,
        "compareDelay": 50,
        "swapDelay": 50
      },
      "categories": ["sorting", "comparison-based", "stable"]
    },
    "quick-sort": { ... },
    "merge-sort": { ... },
    "insertion-sort": { ... },
    "selection-sort": { ... },
    "heap-sort": { ... },
    "counting-sort": { ... },
    "radix-sort": { ... }
  },
  "searching": {
    "linear-search": { ... },
    "binary-search": { ... }
  },
  "trees": { ... },
  "graphs": { ... }
}
```

### 9. Integration with State Management

**Update Zustand stores**:

```typescript
// store/terminalStore.ts
interface TerminalState {
  history: string[];
  output: string;
  isLoading: boolean;
  currentPath: string[];
  lastCommand: string;
  
  addHistory: (cmd: string) => void;
  appendOutput: (output: string) => void;
  clearOutput: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentPath: (path: string[]) => void;
  setLastCommand: (cmd: string) => void;
}

// store/settingsStore.ts - New
interface SettingsState {
  animationSpeed: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  animationMode: 'step' | 'continuous';
  theme: 'dark' | 'light';
  gridSize: number;
  showComplexity: boolean;
  
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}
```

### 10. Hook for Terminal Input

**useTerminal.ts** - React hook:

```typescript
interface UseTerminalReturn {
  output: string;
  isLoading: boolean;
  executeCommand: (command: string) => Promise<void>;
  clearTerminal: () => void;
  getHistory: () => string[];
}

const useTerminal = (): UseTerminalReturn => {
  // Parse command
  // Execute command from registry
  // Update state
  // Return formatted output
};
```

### 11. Error Handling & Validation

**ErrorHandler.ts**:

```typescript
// Requirements:
// - Graceful error messages
// - Suggest corrections for misspelled commands
// - Validate arguments
// - Show usage on error
// - Return exit codes

class ErrorHandler {
  commandNotFound(command: string): string;
  invalidArguments(command: string, args: string[]): string;
  fileNotFound(path: string): string;
  suggestCorrection(input: string): string | null;
}
```

---

## 📝 Terminal Input/Output Examples

### Example 1: List algorithms
```
~/dsa> ls
Sorting/
Searching/
Trees/
Graphs/
Dynamic Programming/

~/dsa>
```

### Example 2: Navigate and view
```
~/dsa> cd sorting
~/dsa/sorting> ls
bubble-sort
insertion-sort
merge-sort
quick-sort
radix-sort

~/dsa/sorting> cat bubble-sort
╔════════════════════════════════════════╗
║ Bubble Sort                            ║
╚════════════════════════════════════════╝

Time Complexity:
  Best:    O(n)
  Average: O(n²)
  Worst:   O(n²)

Space Complexity: O(1)
Stable: Yes
In-place: Yes

~/dsa/sorting>
```

### Example 3: Run algorithm
```
~/dsa/sorting> run bubble-sort -speed 5
Starting visualization...
[████████████████████░] 85%
Completed in 2.34 seconds
```

### Example 4: Help system
```
~/dsa> help ls
ls - List algorithms in current directory

SYNTAX:
  ls [options] [path]

OPTIONS:
  -l, --long      Long format with metadata
  -r, --recursive Show recursively
  -a, --all       Show all including hidden

EXAMPLES:
  ls
  ls -l sorting
  ls -r

~/dsa>
```

---

## 🔧 Implementation Checklist

### Terminal Component:
- [ ] Xterm.js initialization with proper theme
- [ ] Input field that accepts user commands
- [ ] Output area with scrollback
- [ ] Proper cursor positioning
- [ ] Copy/paste functionality
- [ ] Resize handling
- [ ] Dark theme styling

### CLI Parser:
- [ ] Tokenization logic
- [ ] Command validation
- [ ] Argument parsing
- [ ] Error messages
- [ ] Support for quotes and escapes

### Commands (min 15):
- [ ] ls (with -l, -r, -a options)
- [ ] cd (with validation)
- [ ] pwd
- [ ] cat
- [ ] find
- [ ] run
- [ ] stop
- [ ] step
- [ ] pause/resume
- [ ] set/get
- [ ] config
- [ ] help
- [ ] clear
- [ ] history
- [ ] alias

### Integrations:
- [ ] Connect to file explorer store
- [ ] Connect to settings store
- [ ] Connect to canvas rendering
- [ ] Output formatting
- [ ] Command history storage

---

## ✅ Deliverables (End of Phase 2)

### Code Deliverables:
1. ✅ Fully functional TerminalEmulator component (Xterm.js integrated)
2. ✅ CommandParser with complete parsing logic
3. ✅ 15+ commands fully implemented and working
4. ✅ OutputFormatter with ANSI color support
5. ✅ CommandHistory with localStorage persistence
6. ✅ AutoCompleter with tab completion
7. ✅ Comprehensive algorithm metadata (algorithms.json)
8. ✅ Updated Zustand stores for settings
9. ✅ useTerminal React hook
10. ✅ ErrorHandler with helpful messages

### Documentation:
1. ✅ CLI_COMMANDS.md (all 15+ commands documented)
2. ✅ TERMINAL_ARCHITECTURE.md (design and flow)
3. ✅ Updated README with terminal usage examples

### GitHub Commits:
- **Commit 1**: "feat: Phase 2 terminal implementation - Xterm.js integration and UI"
- **Commit 2**: "feat: Phase 2 CLI system - 15+ commands and command parsing complete"

### Testing:
```bash
# All commands should execute without errors
# Terminal should be fully responsive
# Command history should persist across sessions
npm run test:terminal
```

---

## 🚀 Success Criteria

- [ ] Terminal renders correctly and is fully interactive
- [ ] All 15+ commands work without errors
- [ ] Command auto-completion works with Tab key
- [ ] Command history navigable with arrow keys
- [ ] Output formatting shows colors correctly
- [ ] Help system works for all commands
- [ ] Error messages are helpful and clear
- [ ] Terminal integrates with file explorer
- [ ] Settings can be changed via CLI
- [ ] No TypeScript errors

---

## 📝 Notes for LLM

- Each command must have proper validation
- Output should be colorful but readable
- Error messages should suggest fixes
- Keep commands POSIX-compliant where possible
- Test all command combinations
- Ensure state updates properly through Zustand
- No hardcoded paths - use data-driven structure

---

**Next Phase**: Phase 3 will implement the Canvas Rendering Engine and visualization system.

