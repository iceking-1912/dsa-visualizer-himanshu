'use client';

import React from 'react';
import { useExplorerStore } from '@/stores/explorer.store';
import { useAppStore } from '@/stores/app.store';
import { useFileTree } from '@/hooks/useFileTree';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const {
    currentPath,
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
    setCurrentPath,
    setSelectedId,
    expandNode,
  } = useExplorerStore();
  
  const { isPlaying, isPaused } = useAppStore();
  const { categoryDisplayNames } = useFileTree();

  const handleBreadcrumbClick = (index: number) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    
    // Expand the clicked node
    if (newPath.length > 0) {
      expandNode(newPath[newPath.length - 1]);
    }
  };

  const handleClearPath = () => {
    setCurrentPath([]);
    setSelectedId(null);
  };

  const getDisplayName = (segment: string) => {
    return categoryDisplayNames[segment] || segment.split('-').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header
      className={`h-12 bg-[#1a1a1a] border-b border-[#00d4ff]/20 flex items-center justify-between px-4 flex-shrink-0 ${className}`}
    >
      {/* Left section - Hamburger & Title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleLeftSidebar}
          className="lg:hidden p-2 text-[#a0a0a0] hover:text-[#00d4ff] hover:bg-[#252525] rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={leftSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>

        {/* Logo/Title */}
        <h1 className="text-lg font-semibold text-[#00d4ff] hacker-glow hidden sm:block">
          DSA Visualizer
        </h1>
        <h1 className="text-lg font-semibold text-[#00d4ff] hacker-glow sm:hidden">
          DSA
        </h1>

        {/* Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          <span className="text-[#666]">/</span>
          {currentPath.length === 0 ? (
            <span className="text-[#a0a0a0]">Home</span>
          ) : (
            <>
              <button
                onClick={() => handleClearPath()}
                className="text-[#a0a0a0] hover:text-[#00d4ff] transition-colors"
              >
                Home
              </button>
              {currentPath.map((segment, index) => (
                <React.Fragment key={segment}>
                  <span className="text-[#666]">/</span>
                  {index === currentPath.length - 1 ? (
                    <span className="text-[#e0e0e0] font-medium">
                      {getDisplayName(segment)}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className="text-[#a0a0a0] hover:text-[#00d4ff] transition-colors"
                    >
                      {getDisplayName(segment)}
                    </button>
                  )}
                </React.Fragment>
              ))}
              {currentPath.length > 0 && (
                <button
                  onClick={handleClearPath}
                  className="ml-2 p-1 text-[#666] hover:text-[#ff4444] hover:bg-[#ff4444]/10 rounded transition-colors"
                  title="Clear path"
                >
                  ✕
                </button>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Right section - Status & Controls */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying
                ? 'bg-[#00ff88] animate-pulse'
                : isPaused
                ? 'bg-[#ffaa00]'
                : 'bg-[#00ff88]'
            }`}
          />
          <span className="text-[#a0a0a0] hidden sm:inline">
            {isPlaying ? 'Running' : isPaused ? 'Paused' : 'Ready'}
          </span>
        </div>

        {/* Keyboard Shortcuts hint */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-[#666]">
          <kbd className="px-1.5 py-0.5 bg-[#252525] rounded border border-[#333]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-[#252525] rounded border border-[#333]">
            F
          </kbd>
          <span className="ml-1">Search</span>
        </div>

        {/* Right Panel Toggle */}
        <button
          onClick={toggleRightSidebar}
          className="p-2 text-[#a0a0a0] hover:text-[#00d4ff] hover:bg-[#252525] rounded transition-colors"
          aria-label="Toggle settings panel"
          title="Toggle settings panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
