'use client';

import React from 'react';
import { FileTree } from '@/components/explorer';
import { useExplorerStore } from '@/stores/explorer.store';
import { useAppStore } from '@/stores/app.store';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose }) => {
  const { setSelectedId, setCurrentPath } = useExplorerStore();
  const { setActiveAlgorithm } = useAppStore();

  const handleFileSelect = (algorithmId: string) => {
    setSelectedId(algorithmId);
    setActiveAlgorithm(algorithmId);
  };

  const handlePathChange = (path: string[]) => {
    setCurrentPath(path);
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`
        w-72 bg-[#1a1a1a] border-r border-[#00d4ff]/10 
        flex flex-col overflow-hidden flex-shrink-0
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <FileTree onFileSelect={handleFileSelect} onPathChange={handlePathChange} />
    </aside>
  );
};

export default LeftSidebar;
