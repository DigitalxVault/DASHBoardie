'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Dynamically import components with SSR disabled
const WelcomeScreen = dynamic(
  () => import('@/components/WelcomeScreen').then(m => ({ default: m.WelcomeScreen })),
  { ssr: false }
);
const DashboardBuilder = dynamic(
  () => import('@/components/DashboardBuilder').then(m => ({ default: m.DashboardBuilder })),
  { ssr: false }
);

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMain, setShowMain] = useState(false);
  const { setUser, setLoading, isAuthenticated } = useAuthStore();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            setUser(data.user);
            // If already authenticated, skip welcome screen and go directly to dashboard
            setShowWelcome(false);
            setTimeout(() => setShowMain(true), 100);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [setUser, setLoading]);

  const handleEnter = useCallback(() => {
    // Fade out welcome screen
    setShowWelcome(false);
    // Fade in main interface after a short delay
    setTimeout(() => setShowMain(true), 100);
  }, []);

  const handleReturnToWelcome = useCallback(() => {
    // Fade out main interface
    setShowMain(false);
    // Fade in welcome screen after a short delay
    setTimeout(() => setShowWelcome(true), 100);
  }, []);

  return (
    <>
      {/* Welcome Screen - fades out on entry */}
      <div
        className={`transition-opacity duration-300 ease-in ${
          showWelcome ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${showMain ? 'hidden' : ''}`}
      >
        <WelcomeScreen onEnter={handleEnter} isVisible={showWelcome} />
      </div>

      {/* Dashboard Builder - fades in after entry */}
      <div
        className={`transition-opacity duration-400 ease-out ${
          showMain ? 'opacity-100' : 'opacity-0'
        } ${!showMain ? 'invisible' : ''}`}
      >
        <DashboardBuilder onReturnToWelcome={handleReturnToWelcome} />
      </div>
    </>
  );
}
