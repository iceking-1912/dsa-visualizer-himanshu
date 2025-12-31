'use client';

import { ReactNode, useEffect } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
  terminal?: ReactNode;
}

export default function MainLayout({
  children,
  sidebar,
  rightPanel,
  terminal,
}: MainLayoutProps) {
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

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 bg-[#1a1a1a] border-b border-[#00d4ff]/20 flex items-center justify-between px-6 flex-shrink-0">
        <h1 className="text-xl font-semibold text-[#00d4ff] hacker-glow">
          DSA Visualizer
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#a0a0a0]">
          <span className="text-[#00ff88]">●</span>
          <span>Ready</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <aside className="w-72 bg-[#1a1a1a] border-r border-[#00d4ff]/10 overflow-auto flex-shrink-0">
          {sidebar || (
            <div className="p-4 text-[#a0a0a0]">
              <div className="text-xs uppercase tracking-wider text-[#00d4ff] mb-4">
                Algorithms
              </div>
              <div className="space-y-1">
                <div className="text-sm py-1 px-2 rounded hover:bg-[#252525] cursor-pointer">
                  📁 Sorting
                </div>
                <div className="text-sm py-1 px-2 rounded hover:bg-[#252525] cursor-pointer">
                  📁 Searching
                </div>
                <div className="text-sm py-1 px-2 rounded hover:bg-[#252525] cursor-pointer">
                  📁 Trees
                </div>
                <div className="text-sm py-1 px-2 rounded hover:bg-[#252525] cursor-pointer">
                  📁 Graphs
                </div>
                <div className="text-sm py-1 px-2 rounded hover:bg-[#252525] cursor-pointer">
                  📁 Dynamic Programming
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-[#0a0a0a] relative overflow-hidden">
          {children}
        </main>

        {/* Right Sidebar - Tools & Settings */}
        <aside className="w-80 bg-[#1a1a1a] border-l border-[#00d4ff]/10 overflow-auto flex-shrink-0">
          {rightPanel || (
            <div className="p-4 text-[#a0a0a0]">
              <div className="text-xs uppercase tracking-wider text-[#00d4ff] mb-4">
                Controls
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#e0e0e0]">Array Size</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    defaultValue="100"
                    className="w-full accent-[#00d4ff]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#e0e0e0]">Speed</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full accent-[#00d4ff]"
                  />
                </div>
                <button className="w-full py-2 bg-[#00d4ff] text-[#0a0a0a] font-semibold rounded hover:bg-[#00b4df] transition-colors">
                  Start Visualization
                </button>
              </div>
            </div>
          )}
        </aside>
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
