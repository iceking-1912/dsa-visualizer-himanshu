'use client';

import React from 'react';
import { useSettingsStore } from '@/stores/settings.store';
import { useAppStore } from '@/stores/app.store';
import type { AnimationSpeed, AnimationMode, Theme } from '@/types/app';

interface SettingsPanelProps {
  onClose?: () => void;
}

const speedLabels = ['1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const settings = useSettingsStore();
  const appStore = useAppStore();

  const handleSpeedChange = (speed: number) => {
    settings.setSetting('animationSpeed', speed as AnimationSpeed);
    appStore.setAnimationSpeed(speed as AnimationSpeed);
  };

  const handleModeChange = (mode: AnimationMode) => {
    settings.setSetting('animationMode', mode);
  };

  const handleThemeChange = (theme: Theme) => {
    settings.setSetting('theme', theme);
    appStore.setTheme(theme);
  };

  const handleArraySizeChange = (size: number) => {
    appStore.setArraySize(size);
  };

  const handleGridSizeChange = (size: number) => {
    settings.setSetting('gridSize', size);
  };

  const handleReset = () => {
    settings.resetSettings();
    appStore.reset();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#00d4ff]/10 bg-[#1e1e1e]">
        <h2 className="text-lg font-semibold text-[#00d4ff] flex items-center gap-2">
          <span>⚙️</span> Settings
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Animation Settings */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-4 flex items-center gap-2">
            <span>🎬</span> Animation
          </h3>

          {/* Speed Slider */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#c0c0c0]">Speed</label>
              <span className="text-sm text-[#00d4ff] font-mono">
                {settings.animationSpeed}x
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    settings.animationSpeed === speed
                      ? 'bg-[#00d4ff] text-[#0a0a0a]'
                      : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Mode */}
          <div className="space-y-2">
            <label className="text-sm text-[#c0c0c0]">Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('step')}
                className={`flex-1 py-2 rounded text-sm transition-all ${
                  settings.animationMode === 'step'
                    ? 'bg-[#00d4ff] text-[#0a0a0a]'
                    : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
                }`}
              >
                Step
              </button>
              <button
                onClick={() => handleModeChange('continuous')}
                className={`flex-1 py-2 rounded text-sm transition-all ${
                  settings.animationMode === 'continuous'
                    ? 'bg-[#00d4ff] text-[#0a0a0a]'
                    : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
                }`}
              >
                Continuous
              </button>
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-4 flex items-center gap-2">
            <span>🎨</span> Display
          </h3>

          {/* Theme */}
          <div className="space-y-2 mb-4">
            <label className="text-sm text-[#c0c0c0]">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleThemeChange('moonlight')}
                className={`flex-1 py-2 rounded text-sm transition-all flex items-center justify-center gap-2 ${
                  settings.theme === 'moonlight'
                    ? 'bg-[#00d4ff] text-[#0a0a0a]'
                    : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
                }`}
              >
                <span>🌙</span> Moonlight
              </button>
              <button
                onClick={() => handleThemeChange('matrix')}
                className={`flex-1 py-2 rounded text-sm transition-all flex items-center justify-center gap-2 ${
                  settings.theme === 'matrix'
                    ? 'bg-[#00ff88] text-[#0a0a0a]'
                    : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
                }`}
              >
                <span>💚</span> Matrix
              </button>
            </div>
          </div>

          {/* Show Complexity Toggle */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[#c0c0c0]">Show Complexity</span>
            <button
              onClick={() =>
                settings.setSetting('showComplexity', !settings.showComplexity)
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.showComplexity ? 'bg-[#00d4ff]' : 'bg-[#333]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showComplexity ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Data Settings */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-4 flex items-center gap-2">
            <span>📈</span> Data
          </h3>

          {/* Array Size */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#c0c0c0]">Array Size</label>
              <span className="text-sm text-[#00d4ff] font-mono">
                {appStore.arraySize}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              value={appStore.arraySize}
              onChange={(e) => handleArraySizeChange(Number(e.target.value))}
              className="w-full h-2 bg-[#252525] rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#00d4ff] 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-[10px] text-[#666]">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          {/* Grid Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#c0c0c0]">Grid Size</label>
              <span className="text-sm text-[#00d4ff] font-mono">
                {settings.gridSize}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              value={settings.gridSize}
              onChange={(e) => handleGridSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-[#252525] rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#00d4ff] 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-[10px] text-[#666]">
              <span>50</span>
              <span>500</span>
            </div>
          </div>
        </section>

        {/* Statistics Toggles */}
        <section>
          <h3 className="text-xs uppercase tracking-wider text-[#00d4ff] mb-4 flex items-center gap-2">
            <span>📊</span> Statistics Display
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Comparisons', icon: '⚖️' },
              { label: 'Swaps', icon: '🔄' },
              { label: 'Accesses', icon: '👁️' },
              { label: 'Time', icon: '⏱️' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-[#c0c0c0] flex items-center gap-2">
                  <span>{stat.icon}</span> {stat.label}
                </span>
                <button className="relative w-12 h-6 rounded-full transition-colors bg-[#00d4ff]">
                  <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#00d4ff]/10 bg-[#1e1e1e]">
        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-[#252525] text-[#a0a0a0] font-semibold rounded
            hover:bg-[#333] hover:text-[#e0e0e0] transition-all duration-150
            flex items-center justify-center gap-2 border border-[#333]"
        >
          <span>↺</span>
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
