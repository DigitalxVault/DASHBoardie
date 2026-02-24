'use client';

import { GlassButton } from '@/components/ui/GlassButton';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Logo } from '@/components/ui/Logo';
import { useAudio } from '@/providers/AudioProvider';
import { useAuthStore } from '@/stores/authStore';
import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onEnter: () => void;
  isVisible?: boolean;
}

// Platform detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
const isAndroid = /Android/.test(navigator.userAgent);
const isStandalone = (window: Window) =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;

const DISMISSAL_KEY = 'pwa-install-dismissed';
const DISMISSAL_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function WelcomeScreen({ onEnter, isVisible = true }: WelcomeScreenProps) {
  const { unlock } = useAudio();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  // Reset state when returning to welcome screen
  useEffect(() => {
    if (isVisible) {
      setIsUnlocking(false);
    }
  }, [isVisible]);

  // Redirect to Google OAuth if not authenticated
  const redirectToGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || `${window.location.origin}/api/auth/callback/google`;

    if (!clientId) {
      console.error('OAuth client ID not configured');
      return;
    }

    const state = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
      prompt: 'select_account',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

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

    // Check authentication first
    if (!isAuthenticated) {
      redirectToGoogleLogin();
      return;
    }

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
              <Logo width={200} height={60} className="h-12 w-auto object-contain" />
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
              {isAuthenticated
                ? 'Tap below to initialize audio systems and enter the control panel'
                : 'Sign in with your Mages Studio account to continue'
              }
            </p>

            {/* Start Button */}
            <GlassButton
              size="lg"
              variant="primary"
              onClick={handleStart}
              disabled={isUnlocking || isLoading}
              className="w-full max-w-xs mx-auto"
            >
              {isLoading ? 'Checking...' : isUnlocking ? 'Initializing...' : isAuthenticated ? 'Tap to Begin' : 'Sign In with Google'}
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
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(30,30,50,0.9)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                <h3 className="font-semibold text-[#2A2A3A] dark:text-[#F5F5FA]">Install App</h3>
              </div>
              <button
                onClick={handleDismissPWA}
                className="text-[#8A8A9A] hover:text-[#4A4A5A] dark:text-[#9A9AAA] dark:hover:text-[#F5F5FA] p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* iOS Instructions */}
              <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                  <span className="text-xl">🍎</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#2A2A3A] dark:text-[#F5F5FA]">Install on iPhone/iPad</p>
                  <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA] mt-1">
                    Tap <span className="font-medium">Share</span> → <span className="font-medium">Add to Home Screen</span>
                  </p>
                </div>
              </div>

              {/* Android Instructions */}
              <div className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#2A2A3A] dark:text-[#F5F5FA]">Install on Android</p>
                  <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA] mt-1">
                    Tap <span className="font-medium">⋮</span> menu → <span className="font-medium">Install app</span> or <span className="font-medium">Add to Home Screen</span>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#8A8A9A] dark:text-[#7A7A8A] text-center mt-4">
              Install for offline access and a better experience
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
