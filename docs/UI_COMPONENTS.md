# UI Components Documentation

## Phase 4: File Explorer & UI Polish Components

This document describes the UI components implemented in Phase 4 of the DSA Visualizer project.

---

## File Explorer Components

### FileTree (`src/components/explorer/FileTree.tsx`)

Main component for rendering the hierarchical algorithm tree.

**Features:**
- Hierarchical tree structure rendering
- Expand/collapse functionality for folders
- Search/filter with real-time results
- Keyboard navigation (Arrow keys, Enter)
- Selection highlighting
- Smooth animations

**Props:**
```typescript
interface FileTreeProps {
  onFileSelect?: (algorithmId: string) => void;
  onPathChange?: (path: string[]) => void;
}
```

**Usage:**
```tsx
import { FileTree } from '@/components/explorer';

<FileTree 
  onFileSelect={(id) => console.log('Selected:', id)} 
  onPathChange={(path) => console.log('Path:', path)}
/>
```

### FileNode (`src/components/explorer/FileNode.tsx`)

Individual tree node component with recursive rendering.

**Features:**
- Level-based indentation (16px per level)
- Folder/file icons
- Metadata badges (complexity, stability)
- Hover and selection states
- Keyboard focus management

---

## Panel Components

### AlgorithmDetailsPanel (`src/components/panels/AlgorithmDetailsPanel.tsx`)

Right sidebar panel showing algorithm details.

**Features:**
- Algorithm name and category display
- Complexity analysis with visual charts
- Properties grid (stable, in-place, adaptive)
- Code preview with syntax highlighting
- Copy code functionality
- Run visualization button

**Props:**
```typescript
interface AlgorithmDetailsPanelProps {
  algorithmId: string | null;
  onRunClick?: (algorithmId: string) => void;
}
```

### SettingsPanel (`src/components/panels/SettingsPanel.tsx`)

Configuration panel for visualization settings.

**Settings available:**
- Animation speed (1-10)
- Animation mode (step/continuous)
- Theme selection (moonlight/matrix)
- Show complexity toggle
- Array size slider (10-500)
- Grid size slider (50-500)
- Statistics display toggles

### ComplexityChart (`src/components/panels/ComplexityChart.tsx`)

Visual bar chart for complexity comparison.

**Features:**
- Horizontal bar representation
- Color-coded by efficiency
- Best/Average/Worst time complexity
- Space complexity
- Legend for complexity levels

---

## Layout Components

### Header (`src/components/layout/Header.tsx`)

Navigation header with breadcrumbs and controls.

**Features:**
- Logo/title
- Breadcrumb navigation
- Status indicator (Ready/Running/Paused)
- Sidebar toggle buttons
- Keyboard shortcuts hint

### LeftSidebar (`src/components/layout/LeftSidebar.tsx`)

Wrapper for the file explorer.

**Features:**
- Contains FileTree component
- Slide-in/out animations
- Responsive behavior

### RightSidebar (`src/components/layout/RightSidebar.tsx`)

Wrapper for details/settings panels.

**Features:**
- Tab navigation (Details/Settings)
- Contains AlgorithmDetailsPanel or SettingsPanel
- Slide-in/out animations
- Responsive behavior

### MainLayout (`src/components/layout/MainLayout.tsx`)

Main application layout container.

**Features:**
- 3-column desktop layout
- Responsive grid system
- Mobile overlay for sidebars
- Keyboard shortcuts handling

---

## Hooks

### useFileTree (`src/hooks/useFileTree.ts`)

Custom hook for file tree data management.

**Returns:**
```typescript
{
  treeData: TreeNode;
  getAlgorithmById: (id: string) => AlgorithmDetails | null;
  searchTree: (query: string) => TreeNode[];
  getCategoryIcon: (categoryId: string) => string;
  getAllFolderIds: () => string[];
  categoryIcons: Record<string, string>;
  categoryDisplayNames: Record<string, string>;
}
```

---

## Stores

### useExplorerStore (`src/stores/explorer.store.ts`)

Zustand store for file explorer state.

**State:**
- `selectedId`: Currently selected algorithm
- `expandedNodes`: Array of expanded folder IDs
- `currentPath`: Navigation path
- `searchQuery`: Search input value
- `focusedNodeId`: Keyboard-focused node
- `leftSidebarOpen`: Left sidebar visibility
- `rightSidebarOpen`: Right sidebar visibility
- `rightPanelTab`: Active right panel tab

**Actions:**
- Selection management
- Node expand/collapse
- Path navigation
- Search management
- Sidebar toggle

---

## Icons & Badges

### Category Icons
- 🏠 Root
- 🔄 Sorting
- 🔍 Searching
- 🌳 Trees
- 🕸️ Graphs
- 📊 Dynamic Programming

### Complexity Badges
- Green: O(1), O(log n) - Excellent
- Yellow: O(n), O(n log n) - Good
- Orange: O(n²) - Fair
- Red: O(n!), O(2^n) - Poor

### Property Indicators
- ✓ (green): True
- ✗ (red): False
