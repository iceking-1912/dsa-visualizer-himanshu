# DSA Visualizer

> Interactive Data Structures and Algorithms Visualizer with Terminal CLI

A modern, hacker-themed visualization tool for learning and understanding algorithms. Features a full terminal emulator with CLI commands, canvas-based visualizations, and a sleek moonlight design.

## 🚀 Features

- **Terminal CLI** - Full xterm.js-based terminal with 15+ commands
- **Algorithm Library** - Sorting, Searching, Trees, Graphs, and Dynamic Programming
- **Canvas Visualization** - Pixi.js-powered smooth animations
- **Moonlight Theme** - Professional dark theme with cyan accents
- **Keyboard Shortcuts** - Vim-style navigation and controls
- **Persistent State** - Settings and history saved to localStorage

## 🛠️ Tech Stack

- **Next.js 16.1** - React framework with Turbopack
- **React 19.2** - Latest React with concurrent features
- **TypeScript 5.5** - Strict type checking
- **Zustand 5** - State management
- **Xterm.js 5** - Terminal emulator
- **Pixi.js 8** - Canvas rendering
- **Tailwind CSS 4** - Styling

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/iceking-1912/dsa-visualizer-himanshu.git
cd dsa-visualizer-himanshu

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🖥️ Terminal Usage

The terminal is the primary interface for interacting with the visualizer.

### Quick Start

```bash
# List available algorithm categories
ls

# Navigate to sorting algorithms
cd sorting

# View algorithm details
cat bubble-sort

# Run a visualization
run bubble-sort -s 5

# Get help
help
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ls` | List algorithms | `ls -l sorting` |
| `cd` | Change directory | `cd sorting` |
| `pwd` | Print working directory | `pwd` |
| `cat` | View algorithm details | `cat bubble-sort` |
| `find` | Search algorithms | `find O(n)` |
| `run` | Start visualization | `run quick-sort -s 7` |
| `stop` | Stop visualization | `stop` |
| `pause` | Pause animation | `pause` |
| `resume` | Resume animation | `resume` |
| `step` | Step through | `step 5` |
| `set` | Configure setting | `set speed 8` |
| `get` | Get setting value | `get all` |
| `config` | Show all settings | `config` |
| `help` | Show help | `help run` |
| `clear` | Clear terminal | `clear` |
| `history` | Command history | `history 10` |
| `tree` | Show algorithm tree | `tree` |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Auto-complete |
| `↑` / `↓` | Navigate history |
| `Ctrl+C` | Cancel input |
| `Ctrl+L` | Clear screen |
| `Ctrl+U` | Clear line |

## 📚 Algorithm Categories

### Sorting
- Bubble Sort, Insertion Sort, Selection Sort
- Merge Sort, Quick Sort, Heap Sort
- Counting Sort, Radix Sort

### Searching
- Linear Search, Binary Search, Jump Search

### Trees
- Binary Tree Traversal, BST Operations, AVL Tree

### Graphs
- BFS, DFS, Dijkstra's Algorithm

### Dynamic Programming
- Fibonacci, 0/1 Knapsack, LCS

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   ├── layout/            # Layout components
│   ├── terminal/          # Terminal emulator
│   ├── canvas/            # Visualization canvas
│   └── ui/                # UI primitives
├── stores/                # Zustand state management
├── lib/                   # Utilities and CLI
├── hooks/                 # React hooks
├── types/                 # TypeScript definitions
├── constants/             # Design tokens
└── data/                  # Algorithm metadata
```

## 🎨 Design System

The Moonlight Hacker theme uses:

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a0a` | Main background |
| Surface | `#1a1a1a` | Cards, sidebars |
| Cyan | `#00d4ff` | Primary accent |
| Magenta | `#ff00ff` | Secondary accent |
| Green | `#00ff88` | Success states |
| Red | `#ff4444` | Error states |

## 📖 Documentation

- [CLI Commands Reference](./docs/CLI_COMMANDS.md)
- [Terminal Architecture](./docs/TERMINAL_ARCHITECTURE.md)

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📄 License

MIT License - feel free to use this project for learning and personal use.

---

Built with ❤️ using the latest 2025 tech stack
