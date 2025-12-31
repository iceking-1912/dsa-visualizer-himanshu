'use client';

import React, { useCallback, useMemo } from 'react';
import type { TreeNode } from '@/types/app';
import { useFileTree } from '@/hooks/useFileTree';

interface FileNodeProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  searchQuery?: string;
  focusedNodeId?: string | null;
  expandedNodes: string[];
}

const complexityColors: Record<string, string> = {
  'O(1)': 'text-green-400',
  'O(log n)': 'text-green-400',
  'O(n)': 'text-yellow-400',
  'O(n log n)': 'text-yellow-400',
  'O(n²)': 'text-orange-400',
  'O(n!)': 'text-red-400',
};

function getComplexityColor(complexity: string): string {
  // Check for direct match
  if (complexityColors[complexity]) {
    return complexityColors[complexity];
  }
  // Check for partial matches
  for (const [key, color] of Object.entries(complexityColors)) {
    if (complexity.includes(key.replace('O(', '').replace(')', ''))) {
      return color;
    }
  }
  return 'text-gray-400';
}

const FileNode: React.FC<FileNodeProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  searchQuery,
  focusedNodeId,
  expandedNodes,
}) => {
  const { getCategoryIcon } = useFileTree();
  const isFolder = node.type === 'folder';
  const isFocused = focusedNodeId === node.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isFolder) {
        onToggle(node.id);
      } else {
        onSelect(node.id);
      }
    },
    [isFolder, node.id, onToggle, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isFolder) {
        onSelect(node.id);
      }
    },
    [isFolder, node.id, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isFolder) {
          onToggle(node.id);
        } else {
          onSelect(node.id);
        }
      }
    },
    [isFolder, node.id, onToggle, onSelect]
  );

  // Highlight search matches
  const highlightText = useCallback(
    (text: string) => {
      if (!searchQuery) return text;
      const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
      if (index === -1) return text;
      return (
        <>
          {text.slice(0, index)}
          <span className="bg-[#00d4ff]/30 text-[#00d4ff]">
            {text.slice(index, index + searchQuery.length)}
          </span>
          {text.slice(index + searchQuery.length)}
        </>
      );
    },
    [searchQuery]
  );

  const icon = useMemo(() => {
    if (isFolder) {
      if (level === 0) return '🏠';
      return getCategoryIcon(node.id);
    }
    return '📄';
  }, [isFolder, level, node.id, getCategoryIcon]);

  const expandIcon = isFolder ? (isExpanded ? '▼' : '▶') : '';

  return (
    <div className="select-none">
      {/* Node Row */}
      <div
        role="treeitem"
        aria-expanded={isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center gap-2 px-2 py-1.5 cursor-pointer
          transition-all duration-150 ease-out
          border-l-3 rounded-r
          ${isSelected
            ? 'bg-[#252525] border-l-[#00d4ff] text-[#e0e0e0]'
            : 'border-l-transparent hover:bg-[#1e1e1e] hover:border-l-[#00d4ff]/50'
          }
          ${isFocused ? 'ring-1 ring-[#00d4ff]/50' : ''}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand icon for folders */}
        {isFolder && (
          <span className="text-[10px] text-[#a0a0a0] w-3 flex-shrink-0">
            {expandIcon}
          </span>
        )}
        {!isFolder && <span className="w-3 flex-shrink-0" />}

        {/* Node icon */}
        <span className="flex-shrink-0 text-sm">{icon}</span>

        {/* Node name */}
        <span
          className={`flex-1 text-sm truncate ${
            isSelected ? 'text-[#e0e0e0] font-medium' : 'text-[#c0c0c0]'
          }`}
        >
          {highlightText(node.name)}
        </span>

        {/* Metadata badges for files */}
        {!isFolder && node.metadata && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Complexity badge */}
            {node.metadata.timeComplexity && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] ${getComplexityColor(
                  node.metadata.timeComplexity.worst
                )}`}
                title={`Worst: ${node.metadata.timeComplexity.worst}`}
              >
                {node.metadata.timeComplexity.worst}
              </span>
            )}

            {/* Stability badge */}
            {node.metadata.stable !== undefined && (
              <span
                className={`text-[10px] ${
                  node.metadata.stable ? 'text-green-400' : 'text-red-400'
                }`}
                title={node.metadata.stable ? 'Stable' : 'Unstable'}
              >
                {node.metadata.stable ? '✓' : '✗'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Children (recursive) */}
      {isFolder && isExpanded && node.children && (
        <div
          className="overflow-hidden transition-all duration-200 ease-out"
          role="group"
        >
          {node.children.map((child) => (
            <FileNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={expandedNodes.includes(child.id)}
              isSelected={isSelected && false} // Pass selected ID check from parent
              onToggle={onToggle}
              onSelect={onSelect}
              searchQuery={searchQuery}
              focusedNodeId={focusedNodeId}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileNode;
