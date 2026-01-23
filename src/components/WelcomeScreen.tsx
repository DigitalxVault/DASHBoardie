'use client';

import { GlassButton } from '@/components/ui/GlassButton';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useAudio } from '@/providers/AudioProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const { unlock } = useAudio();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fade in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    // Unlock audio context
    await unlock();

    // Small delay for smooth transition
    setTimeout(() => {
      onEnter();
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-lg w-full transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <GlassPanel variant="frosted" padding="lg">
          <div className="text-center space-y-6">
            {/* Company Logo */}
            <div className="flex justify-center mb-4">
              <Image
                src="/images/BLACK FONTS.png"
                alt="Mages Studio"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>

            {/* App Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-text-primary">
                Dash-Boardie
              </h1>
              <p className="text-sm md:text-base text-text-muted font-medium">
                Dashboard Builder for Tabletop Gaming
              </p>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-teal/30 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-accent-teal" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-teal/30 to-transparent" />
            </div>

            {/* Instructions */}
            <p className="text-text-secondary text-sm">
              Tap below to initialize audio systems and enter the control panel
            </p>

            {/* Start Button */}
            <GlassButton
              size="lg"
              variant="primary"
              onClick={handleStart}
              disabled={isUnlocking}
              className="w-full max-w-xs mx-auto"
            >
              {isUnlocking ? 'Initializing...' : 'Tap to Begin'}
            </GlassButton>

            {/* Version info */}
            <p className="text-xs text-text-muted font-medium">
              v1.0.0 // Mages Studio
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
