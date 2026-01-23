'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

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

  const handleEnter = () => {
    // Fade out welcome screen
    setShowWelcome(false);
    // Fade in main interface after a short delay
    setTimeout(() => setShowMain(true), 100);
  };

  return (
    <>
      {/* Welcome Screen - fades out on entry */}
      <div
        className={`transition-opacity duration-300 ease-in ${
          showWelcome ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${showMain ? 'hidden' : ''}`}
      >
        <WelcomeScreen onEnter={handleEnter} />
      </div>

      {/* Dashboard Builder - fades in after entry */}
      <div
        className={`transition-opacity duration-400 ease-out ${
          showMain ? 'opacity-100' : 'opacity-0'
        } ${!showMain ? 'hidden' : ''}`}
      >
        <DashboardBuilder />
      </div>
    </>
  );
}
