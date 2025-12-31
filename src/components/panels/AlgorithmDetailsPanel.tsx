'use client';

import React, { useMemo } from 'react';
import { useFileTree } from '@/hooks/useFileTree';
import { useExplorerStore } from '@/stores/explorer.store';
import { useAppStore } from '@/stores/app.store';
import ComplexityChart from './ComplexityChart';

interface AlgorithmDetailsPanelProps {
  algorithmId: string | null;
  onRunClick?: (algorithmId: string) => void;
}

const AlgorithmDetailsPanel: React.FC<AlgorithmDetailsPanelProps> = ({
  algorithmId,
  onRunClick,
}) => {
  const { getAlgorithmById } = useFileTree();
  const { setPlaying } = useAppStore();

  const algorithm = useMemo(() => {
    if (!algorithmId) return null;
    return getAlgorithmById(algorithmId);
  }, [algorithmId, getAlgorithmById]);

  if (!algorithm) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4 opacity-50">📊</div>
        <h3 className="text-lg font-medium text-[#a0a0a0] mb-2">
          No Algorithm Selected
        </h3>
        <p className="text-sm text-[#666] max-w-[200px]">
          Select an algorithm from the explorer to view details
        </p>
      </div>
    );
  }

  const handleRun = () => {
    if (algorithmId) {
      onRunClick?.(algorithmId);
      setPlaying(true);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#00d4ff]/10 bg-[#1e1e1e]">
        <h2 className="text-lg font-semibold text-[#00d4ff] mb-1 truncate">
          {algorithm.name}
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-[#252525] rounded text-[#a0a0a0]">
            {algorithm.category}
          </span>
          {algorithm.categories?.slice(0, 2).map((cat: string) => (
            <span
              key={cat}
              className="px-2 py-0.5 bg-[#00d4ff]/10 rounded text-[#00d4ff]"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Description */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-2 flex items-center gap-2">
            <span>📝</span> Description
          </h3>
          <p className="text-sm text-[#c0c0c0] leading-relaxed">
            {algorithm.description}
          </p>
        </section>

        {/* Complexity Analysis */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-3 flex items-center gap-2">
            <span>📊</span> Complexity Analysis
          </h3>
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#333]">
            <ComplexityChart
              timeComplexity={algorithm.timeComplexity}
              spaceComplexity={algorithm.spaceComplexity}
            />
          </div>
        </section>

        {/* Properties */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-3 flex items-center gap-2">
            <span>⚙️</span> Properties
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {algorithm.stable !== undefined && (
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333] text-center">
                <div
                  className={`text-lg mb-1 ${
                    algorithm.stable ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {algorithm.stable ? '✓' : '✗'}
                </div>
                <div className="text-[10px] text-[#a0a0a0] uppercase tracking-wider">
                  Stable
                </div>
              </div>
            )}
            {algorithm.inPlace !== undefined && (
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333] text-center">
                <div
                  className={`text-lg mb-1 ${
                    algorithm.inPlace ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {algorithm.inPlace ? '✓' : '✗'}
                </div>
                <div className="text-[10px] text-[#a0a0a0] uppercase tracking-wider">
                  In-Place
                </div>
              </div>
            )}
            {algorithm.adaptive !== undefined && (
              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333] text-center">
                <div
                  className={`text-lg mb-1 ${
                    algorithm.adaptive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {algorithm.adaptive ? '✓' : '✗'}
                </div>
                <div className="text-[10px] text-[#a0a0a0] uppercase tracking-wider">
                  Adaptive
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Code Preview */}
        {algorithm.code && (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-3 flex items-center gap-2">
              <span>💻</span> Code Preview
            </h3>
            <div className="bg-[#0a0e27] rounded-lg border border-[#ff00ff]/20 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-[#0d1230] border-b border-[#ff00ff]/10">
                <span className="text-[10px] text-[#a0a0a0]">JavaScript</span>
                <button
                  onClick={() => {
                    if (algorithm.code) {
                      navigator.clipboard.writeText(algorithm.code);
                    }
                  }}
                  className="text-[10px] text-[#666] hover:text-[#00d4ff] transition-colors"
                  title="Copy code"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="p-4 text-xs text-[#c0c0c0] overflow-x-auto max-h-64">
                <code>{algorithm.code}</code>
              </pre>
            </div>
          </section>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[#00d4ff]/10 bg-[#1e1e1e]">
        <button
          onClick={handleRun}
          className="w-full py-2.5 bg-[#00d4ff] text-[#0a0a0a] font-semibold rounded
            hover:bg-[#00b4df] active:scale-[0.98] transition-all duration-150
            flex items-center justify-center gap-2"
        >
          <span>▶</span>
          <span>Run Visualization</span>
        </button>
      </div>
    </div>
  );
};

export default AlgorithmDetailsPanel;
