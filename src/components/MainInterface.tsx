'use client';

import { SoundEffectsPanel } from '@/components/SoundEffectsPanel';
import { BackgroundMusic } from '@/components/BackgroundMusic';
import { TimerPanel } from '@/components/TimerPanel';
import { DicePanel } from '@/components/DicePanel';
import Image from 'next/image';

export function MainInterface() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Company Logo */}
          <Image
            src="/images/BLACK FONTS.png"
            alt="Mages Studio"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="h-6 w-px bg-[rgba(0,0,0,0.1)]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
              LoFi Interface
            </h1>
            <p className="text-sm text-text-muted font-medium">
              Interactive Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          <span className="text-sm text-text-muted font-medium">Online</span>
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
