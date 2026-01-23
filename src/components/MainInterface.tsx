'use client';

import { SoundEffectsPanel } from '@/components/SoundEffectsPanel';
import { BackgroundMusic } from '@/components/BackgroundMusic';
import { TimerPanel } from '@/components/TimerPanel';
import { DicePanel } from '@/components/DicePanel';
import { Logo } from '@/components/ui/Logo';
import { useAppStore } from '@/stores/appStore';
import { Sun, Moon } from 'lucide-react';

export function MainInterface() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <Logo width={120} height={36} className="h-8 w-auto object-contain" />
          <div className="h-6 w-px bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
              LoFi Interface
            </h1>
            <p className="text-sm text-text-muted font-medium">
              Interactive Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full glass-panel hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-text-secondary" />
            ) : (
              <Moon className="w-5 h-5 text-text-secondary" />
            )}
          </button>
          {/* Online Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-sm text-text-muted font-medium">Online</span>
          </div>
        </div>
      </header>

      {/* Main Grid - Responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 auto-rows-fr">
        {/* Sound Effects Panel */}
        <div className="min-h-[300px] md:min-h-[400px]">
          <SoundEffectsPanel />
        </div>

        {/* Background Music Panel */}
        <div className="min-h-[300px] md:min-h-[400px]">
          <BackgroundMusic />
        </div>

        {/* Timer Panel */}
        <div className="min-h-[300px] md:min-h-[400px]">
          <TimerPanel />
        </div>

        {/* Dice Panel */}
        <div className="min-h-[300px] md:min-h-[400px]">
          <DicePanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-text-muted font-medium">
          Mages Studio // v1.0.0
        </p>
      </footer>
    </div>
  );
}
