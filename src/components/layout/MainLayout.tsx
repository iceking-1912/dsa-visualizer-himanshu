'use client';

import { ReactNode, useEffect } from 'react';
import { useExplorerStore } from '@/stores/explorer.store';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

interface MainLayoutProps {
  children: ReactNode;
  terminal?: ReactNode;
}

export default function MainLayout({
  children,
  terminal,
}: MainLayoutProps) {
  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useExplorerStore();

  useEffect(() => {
    // Preload JetBrains Mono font
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Handle keyboard shortcuts for sidebars
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle left sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleLeftSidebar();
      }
      // Ctrl/Cmd + Shift + B to toggle right sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        toggleRightSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftSidebar, toggleRightSidebar]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Top Bar */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {(leftSidebarOpen || rightSidebarOpen) && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              if (leftSidebarOpen) toggleLeftSidebar();
              if (rightSidebarOpen) toggleRightSidebar();
            }}
          />
        )}

        {/* Left Sidebar - File Explorer */}
        <div
          className={`
            fixed lg:relative z-50 lg:z-auto h-[calc(100vh-3rem-16rem)] lg:h-auto
            transition-transform duration-300 ease-out
            ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'}
          `}
        >
          <LeftSidebar isOpen={leftSidebarOpen} onClose={toggleLeftSidebar} />
        </div>

        {/* Center Canvas */}
        <main className="flex-1 bg-[#0a0a0a] relative overflow-hidden min-w-0 min-h-[300px]">
          {children}
        </main>

        {/* Right Sidebar - Details & Settings */}
        <div
          className={`
            fixed lg:relative right-0 z-50 lg:z-auto h-[calc(100vh-3rem-16rem)] lg:h-auto
            transition-transform duration-300 ease-out
            ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:hidden'}
          `}
        >
          <RightSidebar isOpen={rightSidebarOpen} onClose={toggleRightSidebar} />
        </div>
      </div>

      {/* Bottom Terminal */}
      <div className="h-64 bg-[#0a0e27] border-t border-[#ff00ff]/20 relative flex-shrink-0 overflow-hidden">
        {terminal || (
          <div className="p-4 font-mono text-sm text-[#e0e0e0]">
            <div className="text-[#00d4ff]">~/dsa&gt; <span className="text-[#e0e0e0]">Welcome to DSA Visualizer CLI</span></div>
            <div className="text-[#a0a0a0]">Type &apos;help&apos; for available commands</div>
          </div>
        )}
      </div>
    </div>
  );
}
