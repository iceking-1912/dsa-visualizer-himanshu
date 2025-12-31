'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TreeNode } from '@/types/app';
import { useExplorerStore } from '@/stores/explorer.store';
import { useTerminalStore } from '@/stores/terminal.store';
import { useFileTree } from '@/hooks/useFileTree';
import FileNode from './FileNode';

interface FileTreeProps {
  onFileSelect?: (algorithmId: string) => void;
  onPathChange?: (path: string[]) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, onPathChange }) => {
  const { treeData, searchTree } = useFileTree();
  const {
    selectedId,
    expandedNodes,
    searchQuery,
    focusedNodeId,
    setSelectedId,
    toggleNode,
    setSearchQuery,
    setFocusedNodeId,
    expandAll,
    collapseAll,
    setCurrentPath,
  } = useExplorerStore();

  const { currentPath: terminalPath, setCurrentPath: setTerminalPath } = useTerminalStore();

  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const searchResults = searchQuery.trim() ? searchTree(searchQuery) : [];
  const showSearchResults = searchQuery.trim().length > 0;

  const handleSelect = useCallback(
    (nodeId: string) => {
      setSelectedId(nodeId);
      const path = nodeId.split('/').filter(Boolean);
      setCurrentPath(path);
      // Sync with terminal - prepend 'dsa' to match terminal path format
      // Only update if path is actually different
      const terminalPathWithoutDsa = terminalPath.filter(p => p !== 'dsa');
      if (JSON.stringify(path) !== JSON.stringify(terminalPathWithoutDsa)) {
        setTerminalPath(['dsa', ...path]);
      }
      onPathChange?.(path);
      onFileSelect?.(nodeId);
    },
    [onFileSelect, onPathChange, setCurrentPath, setSelectedId, setTerminalPath, terminalPath]
  );

  const handleToggle = useCallback(
    (nodeId: string) => {
      toggleNode(nodeId);
    },
    [toggleNode]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearching(true);
        searchInputRef.current?.focus();
      }

      if (e.key === 'Escape' && isSearching) {
        setIsSearching(false);
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, setSearchQuery]);

  const flattenTree = useCallback(
    function flatten(node: TreeNode, result: TreeNode[] = []): TreeNode[] {
      result.push(node);
      if (
        node.type === 'folder' &&
        node.children &&
        expandedNodes.includes(node.id)
      ) {
        for (const child of node.children) {
          flatten(child, result);
        }
      }
      return result;
    },
    [expandedNodes]
  );

  const handleTreeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const flatNodes = flattenTree(treeData);
      const currentIndex = flatNodes.findIndex((n) => n.id === focusedNodeId);

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIndex < flatNodes.length - 1) {
            setFocusedNodeId(flatNodes[currentIndex + 1].id);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIndex > 0) {
            setFocusedNodeId(flatNodes[currentIndex - 1].id);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (focusedNodeId) {
            const node = flatNodes.find((n) => n.id === focusedNodeId);
            if (node?.type === 'folder' && !expandedNodes.includes(node.id)) {
              toggleNode(node.id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (focusedNodeId) {
            const node = flatNodes.find((n) => n.id === focusedNodeId);
            if (node?.type === 'folder' && expandedNodes.includes(node.id)) {
              toggleNode(node.id);
            }
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedNodeId) {
            const node = flatNodes.find((n) => n.id === focusedNodeId);
            if (node?.type === 'file') {
              handleSelect(node.id);
            } else if (node?.type === 'folder') {
              toggleNode(node.id);
            }
          }
          break;
        }
        default:
          break;
      }
    },
    [
      expandedNodes,
      flattenTree,
      focusedNodeId,
      handleSelect,
      toggleNode,
      treeData,
      setFocusedNodeId,
    ]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setIsSearching(true);
  };

  useEffect(() => {
    if (!treeContainerRef.current) return;
    treeContainerRef.current.focus({ preventScroll: true });
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      <div className="flex items-center justify-between p-3 border-b border-[#00d4ff]/10">
        <span className="text-xs uppercase tracking-wider text-[#00d4ff] font-medium">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="p-1 text-[#a0a0a0] hover:text-[#00d4ff] hover:bg-[#252525] rounded transition-colors"
            title="Expand All"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
          <button
            onClick={collapseAll}
            className="p-1 text-[#a0a0a0] hover:text-[#00d4ff] hover:bg-[#252525] rounded transition-colors"
            title="Collapse All"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-2 border-b border-[#00d4ff]/10">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search algorithms..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearching(true)}
            className="w-full px-3 py-1.5 pl-8 text-sm bg-[#252525] border border-[#333] rounded
              focus:outline-none focus:border-[#00d4ff]/50 text-[#e0e0e0] placeholder-[#666]
              transition-colors"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#a0a0a0]"
            >
              ✕
            </button>
          )}
        </div>
        {showSearchResults && (
          <div className="mt-1 text-[10px] text-[#a0a0a0]">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      <div
        ref={treeContainerRef}
        className="flex-1 overflow-auto py-2"
        role="tree"
        tabIndex={0}
        onKeyDown={handleTreeKeyDown}
      >
        {showSearchResults ? (
          <div className="space-y-1 px-2">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result.id)}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded
                    transition-colors duration-150
                    ${selectedId === result.id
                      ? 'bg-[#252525] text-[#e0e0e0]'
                      : 'hover:bg-[#1e1e1e] text-[#c0c0c0]'
                    }
                  `}
                >
                  <span className="text-sm">📄</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{result.name}</div>
                    <div className="text-[10px] text-[#666] truncate">
                      {result.path.join(' / ')}
                    </div>
                  </div>
                  {result.metadata?.timeComplexity && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#a0a0a0]">
                      {result.metadata.timeComplexity.worst}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#666] text-sm">
                No algorithms found
              </div>
            )}
          </div>
        ) : (
          <FileNode
            node={treeData}
            level={0}
            isExpanded={expandedNodes.includes(treeData.id)}
            isSelected={selectedId === treeData.id}
            onToggle={handleToggle}
            onSelect={handleSelect}
            searchQuery={searchQuery}
            focusedNodeId={focusedNodeId}
            expandedNodes={expandedNodes}
          />
        )}
      </div>
    </div>
  );
};

export default FileTree;
