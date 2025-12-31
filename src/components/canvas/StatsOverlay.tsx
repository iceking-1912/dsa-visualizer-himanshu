'use client';

interface StatsOverlayProps {
  algorithmName: string;
  arraySize: number;
  comparisons: number;
  swaps: number;
  timeElapsed: number;
  isPaused: boolean;
  speed: number;
  progress: number;
  fps?: number;
}

export default function StatsOverlay({
  algorithmName,
  arraySize,
  comparisons,
  swaps,
  timeElapsed,
  isPaused,
  speed,
  progress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fps = 60,
}: StatsOverlayProps) {
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatAlgorithmName = (name: string): string => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="absolute top-4 right-4 bg-[#1a1a1a]/95 border border-[#00d4ff]/30 rounded-lg p-4 font-mono text-sm shadow-lg backdrop-blur-sm min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#00d4ff]/20">
        <h3 className="text-[#00d4ff] font-semibold">
          {formatAlgorithmName(algorithmName)}
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            isPaused
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {isPaused ? 'Paused' : 'Running'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="space-y-2 text-[#e0e0e0]">
        <div className="flex justify-between">
          <span className="text-[#a0a0a0]">Array Size:</span>
          <span>{arraySize.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#a0a0a0]">Comparisons:</span>
          <span className="text-[#00d4ff]">{comparisons.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#a0a0a0]">Swaps:</span>
          <span className="text-[#ff006e]">{swaps.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#a0a0a0]">Time:</span>
          <span>{formatTime(timeElapsed)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#a0a0a0]">Speed:</span>
          <span>{speed}/10</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 pt-3 border-t border-[#00d4ff]/20">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#a0a0a0]">Progress</span>
          <span className="text-[#00d4ff]">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#ff006e] transition-all duration-200"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Controls hint */}
      <div className="mt-3 pt-3 border-t border-[#00d4ff]/20 text-xs text-[#a0a0a0]">
        <div className="flex gap-2">
          <code className="px-1 bg-[#252525] rounded">pause</code>
          <code className="px-1 bg-[#252525] rounded">stop</code>
          <code className="px-1 bg-[#252525] rounded">speed [1-10]</code>
        </div>
      </div>
    </div>
  );
}
