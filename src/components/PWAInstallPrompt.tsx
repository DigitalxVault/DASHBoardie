'use client';

import { useEffect, useState } from 'react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up rounded-[20px] bg-[rgba(255,255,255,0.65)] dark:bg-[rgba(30,30,50,0.75)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[#2A2A3A] dark:text-[#F5F5FA] text-sm">Install App</h3>
          <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA] mt-1">
            Install Dash-Boardie for offline access and a better experience.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[#8A8A9A] hover:text-[#4A4A5A] dark:text-[#9A9AAA] dark:hover:text-[#F5F5FA] p-1 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleInstall}
          className="flex-1 bg-gradient-to-r from-[#3BC9DB] to-[#38D9A9] text-white text-sm font-semibold py-2 px-4 rounded-full hover:shadow-[0_6px_20px_rgba(56,217,169,0.5)] transition-all"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(255,255,255,0.1)] text-[#4A4A5A] dark:text-[#9A9AAA] text-sm font-medium py-2 px-4 rounded-full border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)] backdrop-blur-[10px] hover:bg-[rgba(255,255,255,0.85)] dark:hover:bg-[rgba(255,255,255,0.15)] transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
