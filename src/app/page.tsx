'use client';

import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';

// Dynamically import Terminal to avoid SSR issues with xterm.js
const TerminalEmulator = dynamic(
  () => import('@/components/terminal/TerminalEmulator'),
  { ssr: false }
);

export default function Home() {
  return (
    <MainLayout
      terminal={<TerminalEmulator height="100%" theme="dark" />}
    >
      {/* Canvas area placeholder */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-[#00d4ff]">
            Visualization Canvas
          </h2>
          <p className="text-[#a0a0a0] max-w-md">
            Select an algorithm from the sidebar or use the terminal to start
            visualizing data structures and algorithms.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <div className="px-4 py-2 bg-[#252525] rounded border border-[#00d4ff]/20 text-sm">
              <span className="text-[#00d4ff]">run</span>{' '}
              <span className="text-[#a0a0a0]">bubble-sort</span>
            </div>
            <div className="px-4 py-2 bg-[#252525] rounded border border-[#00d4ff]/20 text-sm">
              <span className="text-[#00d4ff]">help</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
