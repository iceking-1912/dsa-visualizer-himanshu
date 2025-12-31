// File Explorer type definitions

import type { TreeNode, AlgorithmMetadata } from './app';

export interface FileTreeProps {
  data: TreeNode;
  onFileSelect: (algorithmId: string) => void;
  onPathChange: (path: string[]) => void;
  selectedId?: string;
  expandedNodes?: Set<string>;
  searchQuery?: string;
}

export interface FileNodeProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onPathChange: (path: string[]) => void;
  searchQuery?: string;
  focusedNodeId?: string;
}

export interface AlgorithmDetailsPanelProps {
  algorithmId: string | null;
  onRunClick?: (algorithmId: string) => void;
}

export interface AlgorithmDetails extends AlgorithmMetadata {
  name: string;
  id: string;
  category: string;
}

export interface SettingsPanelProps {
  onClose?: () => void;
}

export interface ComplexityChartProps {
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}

export interface HeaderProps {
  currentPath: string[];
  onPathChange: (path: string[]) => void;
  onToggleSidebarLeft: () => void;
  onToggleSidebarRight: () => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
}

export interface FileExplorerState {
  selectedId: string | null;
  expandedNodes: Set<string>;
  currentPath: string[];
  searchQuery: string;
  focusedNodeId: string | null;
}

export interface RightPanelTab {
  id: 'details' | 'settings';
  label: string;
  icon: string;
}
