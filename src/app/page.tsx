'use client';

import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import { useExplorerStore } from '@/stores/explorer.store';
import { useAppStore } from '@/stores/app.store';
import { useFileTree } from '@/hooks/useFileTree';

// Dynamically import Terminal to avoid SSR issues with xterm.js
const TerminalEmulator = dynamic(
  () => import('@/components/terminal/TerminalEmulator'),
  { ssr: false }
);

// Dynamically import CanvasRenderer to avoid SSR issues with Pixi.js
const CanvasRenderer = dynamic(
  () => import('@/components/canvas/CanvasRenderer'),
  { ssr: false }
);

export default function Home() {
  const { selectedId } = useExplorerStore();
  const { activeAlgorithm, isPlaying } = useAppStore();
  const { getAlgorithmById } = useFileTree();

  // Reserved for future use - algorithm details panel
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentAlgorithm = selectedId ? getAlgorithmById(selectedId) : null;

  return (
    <MainLayout
      terminal={<TerminalEmulator height="100%" theme="dark" />}
    >
      {/* Canvas visualization area */}
      <CanvasRenderer
        algorithmName={isPlaying && activeAlgorithm ? activeAlgorithm : undefined}
        isRunning={isPlaying}
        showStats={true}
      />
    </MainLayout>
  );
}
