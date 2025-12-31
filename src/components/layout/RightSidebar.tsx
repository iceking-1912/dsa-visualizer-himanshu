'use client';

import React from 'react';
import { useExplorerStore } from '@/stores/explorer.store';
import { AlgorithmDetailsPanel, SettingsPanel } from '@/components/panels';

interface RightSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ isOpen, onClose }) => {
  const { selectedId, rightPanelTab, setRightPanelTab } = useExplorerStore();

  if (!isOpen) return null;

  return (
    <aside
      className={`
        w-80 bg-[#1a1a1a] border-l border-[#00d4ff]/10 
        flex flex-col overflow-hidden flex-shrink-0
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-[#00d4ff]/10 bg-[#1e1e1e]">
        <button
          onClick={() => setRightPanelTab('details')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${
              rightPanelTab === 'details'
                ? 'text-[#00d4ff] border-b-2 border-[#00d4ff] bg-[#1a1a1a]'
                : 'text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#252525]'
            }`}
        >
          <span>📊</span>
          <span className="hidden sm:inline">Details</span>
        </button>
        <button
          onClick={() => setRightPanelTab('settings')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${
              rightPanelTab === 'settings'
                ? 'text-[#00d4ff] border-b-2 border-[#00d4ff] bg-[#1a1a1a]'
                : 'text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#252525]'
            }`}
        >
          <span>⚙️</span>
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {rightPanelTab === 'details' ? (
          <AlgorithmDetailsPanel algorithmId={selectedId} />
        ) : (
          <SettingsPanel />
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
