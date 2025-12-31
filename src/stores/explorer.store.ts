import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExplorerState {
  // Selection state
  selectedId: string | null;
  expandedNodes: string[];
  currentPath: string[];
  
  // Search
  searchQuery: string;
  focusedNodeId: string | null;
  
  // UI state
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  rightPanelTab: 'details' | 'settings';
}

interface ExplorerStore extends ExplorerState {
  // Selection actions
  setSelectedId: (id: string | null) => void;
  toggleNode: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  
  // Path navigation
  setCurrentPath: (path: string[]) => void;
  navigateToPath: (path: string[]) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  setFocusedNodeId: (id: string | null) => void;
  
  // UI actions
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setRightPanelTab: (tab: 'details' | 'settings') => void;
  
  // Helpers
  isExpanded: (id: string) => boolean;
}

const initialState: ExplorerState = {
  selectedId: null,
  expandedNodes: ['root', 'sorting'], // Start with root and sorting expanded
  currentPath: [],
  searchQuery: '',
  focusedNodeId: null,
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  rightPanelTab: 'details',
};

export const useExplorerStore = create<ExplorerStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSelectedId: (id) => set({ selectedId: id }),
      
      toggleNode: (id) => {
        const expanded = get().expandedNodes;
        if (expanded.includes(id)) {
          set({ expandedNodes: expanded.filter((n) => n !== id) });
        } else {
          set({ expandedNodes: [...expanded, id] });
        }
      },
      
      expandNode: (id) => {
        const expanded = get().expandedNodes;
        if (!expanded.includes(id)) {
          set({ expandedNodes: [...expanded, id] });
        }
      },
      
      collapseNode: (id) => {
        const expanded = get().expandedNodes;
        set({ expandedNodes: expanded.filter((n) => n !== id) });
      },
      
      expandAll: () => {
        // This will be called with all folder IDs
        set({ expandedNodes: ['root', 'sorting', 'searching', 'trees', 'graphs', 'dynamic-programming'] });
      },
      
      collapseAll: () => {
        set({ expandedNodes: [] });
      },
      
      setCurrentPath: (path) => set({ currentPath: path }),
      
      navigateToPath: (path) => {
        // Expand all nodes in path
        const expanded = [...get().expandedNodes];
        let currentId = 'root';
        for (const segment of path) {
          currentId = segment;
          if (!expanded.includes(currentId)) {
            expanded.push(currentId);
          }
        }
        set({ currentPath: path, expandedNodes: expanded });
      },
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFocusedNodeId: (id) => set({ focusedNodeId: id }),
      
      toggleLeftSidebar: () => set({ leftSidebarOpen: !get().leftSidebarOpen }),
      
      toggleRightSidebar: () => set({ rightSidebarOpen: !get().rightSidebarOpen }),
      
      setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
      
      setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
      
      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
      
      isExpanded: (id) => get().expandedNodes.includes(id),
    }),
    {
      name: 'dsa-visualizer-explorer',
      partialize: (state) => ({
        expandedNodes: state.expandedNodes,
        leftSidebarOpen: state.leftSidebarOpen,
        rightSidebarOpen: state.rightSidebarOpen,
        rightPanelTab: state.rightPanelTab,
      }),
    }
  )
);
