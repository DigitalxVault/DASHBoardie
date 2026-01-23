'use client';

import { GlassButton } from '@/components/ui/GlassButton';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useAudio } from '@/providers/AudioProvider';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface WelcomeScreenProps {
  onEnter: () => void;
}

// Platform detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
const isAndroid = /Android/.test(navigator.userAgent);
const isStandalone = (window: Window) =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;

const DISMISSAL_KEY = 'pwa-install-dismissed';
const DISMISSAL_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const { unlock } = useAudio();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Check if user previously dismissed the prompt
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSAL_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISSAL_DURATION) {
        return; // Don't show if dismissed within 30 days
      }
    }

    // Don't show if already installed as PWA
    if (isStandalone(window)) {
      return;
    }

    // Show PWA install prompt after 1.5 seconds
    const timer = setTimeout(() => {
      setShowPWAInstall(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Hide PWA prompt when entering the app
  const handleStart = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    setShowPWAInstall(false);

    // Unlock audio context
    await unlock();

    // Small delay for smooth transition
    setTimeout(() => {
      onEnter();
    }, 400);
  };

  const handleDismissPWA = () => {
    setShowPWAInstall(false);
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
  };

  // Fade in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
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
                LoFi Interface
              </h1>
              <p className="text-sm md:text-base text-text-muted font-medium">
                Board Game Control Panel
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

      {/* PWA Install Prompt */}
      {showPWAInstall && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 animate-slide-up z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <h3 className="font-semibold text-text-primary">Install App</h3>
              </div>
              <button
                onClick={handleDismissPWA}
                className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-black/5 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* iOS Instructions */}
              <div className="flex items-start gap-3 p-3 bg-black/5 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-.59.35-1.63 1.54-1.12 1.35-1.45 3.27-.46 4.65.98 1.41 2.58 1.73 4.21zM15 6.02c.67-.82 1.12-1.95 1-3.02-1.12.05-2.32.78-2.98 1.59-.67.82-1.12 1.95-1 3.02 1.12.05 2.32-.78 2.98-1.59z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary">Install on iPhone/iPad</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Tap <span className="font-medium">Share</span> → <span className="font-medium">Add to Home Screen</span>
                  </p>
                </div>
              </div>

              {/* Android Instructions */}
              <div className="flex items-start gap-3 p-3 bg-black/5 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9996-.4485-.9996-.9996s.4485-.9996.9996-.9996c.5511 0 .9996.4485.9996.9996s-.4485.9996-.9996.9996zm-11.046 0c-.5511 0-.9996-.4485-.9996-.9996s.4485-.9996.9996-.9996c.5511 0 .9996.4485.9996.9996s-.4485.9996-.9996.9996zM12 .0001c-6.6274 0-12 5.3726-12 12 0 6.6274 5.3726 12 12 12 6.6274 0 12-5.3726 12-12 0-6.6274-5.3726-12-12-12zm5.934 17.3213c-.066.093-.185.149-.309.149h-1.956c-.106 0-.189-.027-.246-.081-.058-.054-.105-.13-.143-.227-.283-.733-.61-1.376-.983-1.928-.373-.552-.765-.991-1.176-1.316-.412-.325-.79-.487-1.135-.487-.246 0-.431.069-.554.208-.123.139-.185.352-.185.638 0 .273.066.617.198 1.032.132.415.323.889.572 1.421.497 1.083.746 1.938.746 2.565 0 .402-.068.712-.204.931-.136.219-.333.328-.59.328-.245 0-.457-.083-.636-.249-.179-.166-.344-.455-.495-.867-.151-.412-.317-.824-.498-1.236-.181-.412-.389-.776-.623-1.093-.234-.317-.521-.564-.861-.741-.34-.177-.738-.265-1.194-.265-.456 0-.854.088-1.194.265-.34.177-.627.424-.861.741-.234.317-.442.681-.623 1.093-.181.412-.347.824-.498 1.236-.151.412-.316.701-.495.867-.179.166-.391.249-.636.249-.257 0-.454-.109-.59-.328-.136-.219-.204-.529-.204-.931 0-.627.249-1.482.746-2.565.249-.532.44-1.006.572-1.421.132-.415.198-.759.198-1.032 0-.286-.062-.499-.185-.638-.123-.139-.308-.208-.554-.208-.345 0-.723.162-1.135.487-.412.325-.804.764-1.176 1.316-.373.552-.7 1.195-.983 1.928-.038.097-.085.173-.143.227-.058.054-.14.081-.246.081H3.535c-.124 0-.243-.056-.309-.149-.066-.093-.078-.205-.036-.336.689-2.158 1.683-3.856 2.981-5.094 1.299-1.238 2.764-1.857 4.397-1.857.614 0 1.168.103 1.662.308.494.206 1.025.308 1.584.308.559 0 1.09-.102 1.584-.308.494-.206 1.048-.308 1.662-.308 1.633 0 3.098.619 4.397 1.857 1.298 1.238 2.292 2.936 2.981 5.094.042.131.03.243-.036.336z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-text-primary">Install on Android</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Tap <span className="font-medium">⋮</span> menu → <span className="font-medium">Install app</span> or <span className="font-medium">Add to Home Screen</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-text-muted text-center mt-4">
              Install for offline access and a better experience
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
