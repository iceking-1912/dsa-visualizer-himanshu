'use client';

import React from 'react';

interface ComplexityChartProps {
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}

// Map complexity notation to relative bar width (1-100%)
const complexityToWidth: Record<string, number> = {
  'O(1)': 10,
  'O(log n)': 20,
  'O(√n)': 25,
  'O(n)': 35,
  'O(n log n)': 50,
  'O(n²)': 75,
  'O(n³)': 85,
  'O(2^n)': 95,
  'O(n!)': 100,
  // Handle variations
  'O(nk)': 55,
  'O(n + k)': 40,
  'O(nW)': 60,
  'O(mn)': 70,
  'O(V + E)': 45,
  'O((V + E) log V)': 55,
  'O(h)': 25,
};

const complexityToColor: Record<string, string> = {
  'O(1)': 'bg-green-500',
  'O(log n)': 'bg-green-400',
  'O(√n)': 'bg-green-400',
  'O(n)': 'bg-yellow-400',
  'O(n log n)': 'bg-yellow-500',
  'O(n²)': 'bg-orange-500',
  'O(n³)': 'bg-red-400',
  'O(2^n)': 'bg-red-500',
  'O(n!)': 'bg-red-600',
};

function getBarWidth(complexity: string): number {
  // Direct match
  if (complexityToWidth[complexity]) {
    return complexityToWidth[complexity];
  }
  
  // Try to parse and match patterns
  if (complexity.includes('n²') || complexity.includes('n^2')) return 75;
  if (complexity.includes('n log n') || complexity.includes('nlogn')) return 50;
  if (complexity.includes('log n') || complexity.includes('logn')) return 20;
  if (complexity.includes('√n') || complexity.includes('sqrt')) return 25;
  if (complexity.includes('n!')) return 100;
  if (complexity.includes('2^n')) return 95;
  if (complexity.includes('n³')) return 85;
  if (complexity.includes('mn') || complexity.includes('nk') || complexity.includes('nW')) return 60;
  if (complexity.includes('V + E')) return 45;
  if (complexity.includes('n)') || complexity.includes('(n)')) return 35;
  if (complexity.includes('1)') || complexity.includes('(1)')) return 10;
  
  // Default
  return 40;
}

function getBarColor(complexity: string): string {
  // Direct match
  if (complexityToColor[complexity]) {
    return complexityToColor[complexity];
  }
  
  // Pattern matching
  if (complexity.includes('1)')) return 'bg-green-500';
  if (complexity.includes('log n')) return 'bg-green-400';
  if (complexity.includes('n²') || complexity.includes('n^2')) return 'bg-orange-500';
  if (complexity.includes('n log n')) return 'bg-yellow-500';
  if (complexity.includes('n!')) return 'bg-red-600';
  if (complexity.includes('2^n')) return 'bg-red-500';
  
  return 'bg-blue-400';
}

const ComplexityChart: React.FC<ComplexityChartProps> = ({
  timeComplexity,
  spaceComplexity,
}) => {
  const complexities = [
    { label: 'Best', value: timeComplexity.best, type: 'time' },
    { label: 'Average', value: timeComplexity.average, type: 'time' },
    { label: 'Worst', value: timeComplexity.worst, type: 'time' },
    { label: 'Space', value: spaceComplexity, type: 'space' },
  ];

  return (
    <div className="space-y-3">
      {complexities.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#a0a0a0]">{item.label}:</span>
            <span
              className={`font-mono ${
                item.type === 'time' ? 'text-[#00d4ff]' : 'text-[#ff00ff]'
              }`}
            >
              {item.value}
            </span>
          </div>
          <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(
                item.value
              )}`}
              style={{ width: `${getBarWidth(item.value)}%` }}
            />
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="pt-2 border-t border-[#333] mt-3">
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[#888]">Excellent</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-[#888]">Good</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-[#888]">Fair</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-[#888]">Poor</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplexityChart;
