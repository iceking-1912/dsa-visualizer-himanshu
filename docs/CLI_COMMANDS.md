# DSA Visualizer CLI Commands Reference

## Navigation & File Commands

### `ls` - List algorithms
List algorithms in current directory.

**Syntax:** `ls [options] [path]`

**Options:**
- `-l, --long` - Long format with metadata
- `-a, --all` - Show all including hidden
- `-r, --recursive` - Show recursively

**Examples:**
```bash
ls                    # List current directory
ls -l                 # Long format with details
ls sorting            # List sorting algorithms
ls -l sorting         # Long format for sorting
```

---

### `cd` - Change directory
Navigate to a different algorithm category or algorithm.

**Syntax:** `cd [path]`

**Examples:**
```bash
cd sorting            # Go to sorting category
cd ..                 # Go up one level
cd /                  # Go to root
cd ~                  # Go to root
cd sorting/bubble-sort # Navigate to specific algorithm
```

---

### `pwd` - Print working directory
Display the current path.

**Syntax:** `pwd`

**Examples:**
```bash
pwd                   # Output: ~/dsa/sorting
```

---

### `cat` - Display algorithm details
Show detailed information about an algorithm.

**Syntax:** `cat [algorithm]`

**Options:**
- `-c, --code` - Show code only

**Examples:**
```bash
cat bubble-sort       # Show full details
cat -c quick-sort     # Show code only
cat sorting/merge-sort # Show by full path
```

---

### `find` - Search algorithms
Search for algorithms by name, description, or complexity.

**Syntax:** `find [query]`

**Options:**
- `-t, --type` - Filter by category

**Examples:**
```bash
find bubble           # Search for "bubble"
find -t sorting quick # Search in sorting category
find O(n)             # Search by complexity
```

---

## Visualization Commands

### `run` - Execute algorithm visualization
Start visualizing an algorithm.

**Syntax:** `run [algorithm] [options]`

**Options:**
- `-s, --speed` - Animation speed (1-10), default: 5
- `-m, --mode` - Mode (step/continuous), default: continuous
- `-n, --size` - Array size, default: 100

**Examples:**
```bash
run bubble-sort           # Run with defaults
run -s 7 quick-sort       # Run at speed 7
run merge-sort -m step    # Run in step mode
run heap-sort -n 50       # Run with 50 elements
```

---

### `stop` - Stop visualization
Halt the current visualization.

**Syntax:** `stop`

**Aliases:** `halt`, `kill`

---

### `pause` - Pause visualization
Pause the current animation.

**Syntax:** `pause`

---

### `resume` - Resume visualization
Resume a paused visualization.

**Syntax:** `resume`

**Aliases:** `continue`

---

### `step` - Step through visualization
Advance one step at a time (in step mode).

**Syntax:** `step [count]`

**Examples:**
```bash
step                  # Step forward 1 step
step 5                # Step forward 5 steps
```

---

## Configuration Commands

### `set` - Configure settings
Change a setting value.

**Syntax:** `set [setting] [value]`

**Available settings:**
- `speed` - Animation speed (1-10)
- `mode` - Animation mode (step/continuous)
- `theme` - Theme (moonlight/matrix)
- `gridSize` - Grid size for visualization
- `showComplexity` - Show complexity info (true/false)

**Examples:**
```bash
set speed 7           # Set speed to 7
set mode step         # Set step mode
set theme moonlight   # Set theme
```

---

### `get` - Display setting value
Show current value of a setting.

**Syntax:** `get [setting|all]`

**Examples:**
```bash
get speed             # Show speed setting
get all               # Show all settings
```

---

### `config` - Show all configuration
Display all current settings.

**Syntax:** `config`

**Aliases:** `settings`

---

## System Commands

### `help` - Display help
Show help information for commands.

**Syntax:** `help [command]`

**Aliases:** `?`, `man`

**Examples:**
```bash
help                  # Show all commands
help ls               # Show help for ls command
help run              # Show help for run command
```

---

### `clear` - Clear terminal
Clear the terminal screen.

**Syntax:** `clear`

**Aliases:** `cls`, `reset`

---

### `history` - Show command history
Display previously executed commands.

**Syntax:** `history [count]`

**Examples:**
```bash
history               # Show all history
history 10            # Show last 10 commands
```

---

### `alias` - Create shortcuts
Create command aliases.

**Syntax:** `alias [name] '[command]'`

**Examples:**
```bash
alias qs 'run quick-sort'
alias bs 'run bubble-sort -s 7'
```

---

### `export` - Export session data
Export visualization data or history.

**Syntax:** `export [format]`

**Formats:** json, csv, txt

**Examples:**
```bash
export json           # Export as JSON
export csv            # Export as CSV
```

---

### `tree` - Display algorithm tree
Show the algorithm hierarchy as a tree.

**Syntax:** `tree [path]`

**Examples:**
```bash
tree                  # Show full tree
tree sorting          # Show sorting tree
```

---

### `echo` - Print text
Print text to the terminal.

**Syntax:** `echo [text]`

**Examples:**
```bash
echo Hello World
echo "Quoted text"
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Auto-complete command or path |
| `↑` / `↓` | Navigate command history |
| `←` / `→` | Move cursor |
| `Ctrl+C` | Cancel current input |
| `Ctrl+L` | Clear screen |
| `Ctrl+U` | Clear current line |
| `Ctrl+W` | Delete word |
| `Delete` | Delete character at cursor |

---

## Quick Start

1. **List available algorithms:**
   ```bash
   ls
   ```

2. **Navigate to a category:**
   ```bash
   cd sorting
   ```

3. **View algorithm details:**
   ```bash
   cat bubble-sort
   ```

4. **Run a visualization:**
   ```bash
   run bubble-sort -s 5
   ```

5. **Get help:**
   ```bash
   help run
   ```
