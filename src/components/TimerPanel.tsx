'use client';

import { GlassPanel, GlassWell } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAppStore } from '@/stores/appStore';
import { useSound } from 'use-sound';
import { useCallback, useEffect, useRef, useState } from 'react';

// Timer presets (in seconds) - compact 2x2 grid
const PRESETS = [
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '10m', seconds: 600 },
];

// Format seconds to MM:SS (main display)
function formatCountdownMain(seconds: number): string {
  if (seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format milliseconds portion (0-99)
function formatMilliseconds(ms: number): string {
  return Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
}

// Format seconds to HH:MM:SS (main display)
function formatStopwatchMain(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Parse MM:SS input to seconds
function parseTimeInput(input: string): number {
  const parts = input.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (!isNaN(mins) && !isNaN(secs) && mins >= 0 && secs >= 0 && secs < 60) {
      return mins * 60 + secs;
    }
  }
  // Try parsing as just minutes
  const justMins = parseInt(input, 10);
  if (!isNaN(justMins) && justMins > 0) {
    return justMins * 60;
  }
  return 0;
}

// Countdown Timer Component (Compact version with milliseconds)
function CountdownTimer() {
  const { timer, setCountdownTime, setTimerRunning, resetCountdown, setTimerInitialTime } = useAppStore();
  const { countdownTime, initialTime, isRunning } = timer;
  const [customInput, setCustomInput] = useState('');
  const [hasAlerted, setHasAlerted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Track pause state
  const [displayMs, setDisplayMs] = useState(0); // Milliseconds for display
  const countdownRef = useRef(countdownTime * 1000); // Store in milliseconds
  const lastUpdateRef = useRef(Date.now());

  // Keep ref updated when countdownTime changes externally (but not when paused)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      countdownRef.current = countdownTime * 1000;
      setDisplayMs(0);
    }
  }, [countdownTime, isRunning, isPaused]);

  // Alert sound for timer zero
  const [playAlert] = useSound('/sounds/effects/Alien%20Same%20Zone.mp3', {
    volume: 1.0,
    html5: true,
  });

  // Timer tick effect with millisecond precision
  useEffect(() => {
    if (!isRunning || countdownTime <= 0) {
      if (countdownTime <= 0 && initialTime > 0 && !hasAlerted) {
        playAlert();
        setHasAlerted(true);
        setTimerRunning(false);
      }
      return;
    }

    lastUpdateRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      const newTimeMs = Math.max(0, countdownRef.current - delta);
      countdownRef.current = newTimeMs;

      // Update display milliseconds
      setDisplayMs(newTimeMs % 1000);

      // Update seconds in store (only when second changes)
      const newSeconds = Math.ceil(newTimeMs / 1000);
      if (newSeconds !== countdownTime) {
        setCountdownTime(newSeconds);
      }

      // Check for zero
      if (newTimeMs <= 0) {
        setCountdownTime(0);
        setDisplayMs(0);
      }
    }, 50); // Update every 50ms for smooth millisecond display

    return () => clearInterval(interval);
  }, [isRunning, countdownTime, initialTime, hasAlerted, playAlert, setCountdownTime, setTimerRunning]);

  const handlePreset = useCallback(
    (seconds: number) => {
      setTimerInitialTime(seconds);
      setCountdownTime(seconds);
      setTimerRunning(false);
      setHasAlerted(false);
      setIsPaused(false);
      countdownRef.current = seconds * 1000;
      setDisplayMs(0);
    },
    [setTimerInitialTime, setCountdownTime, setTimerRunning]
  );

  const handleCustomSet = useCallback(() => {
    const seconds = parseTimeInput(customInput);
    if (seconds > 0) {
      handlePreset(seconds);
      setCustomInput('');
    }
  }, [customInput, handlePreset]);

  const handleStart = useCallback(() => {
    if (countdownTime <= 0 && initialTime > 0) {
      // Reset to initial time if at zero
      countdownRef.current = initialTime * 1000;
      setCountdownTime(initialTime);
    }
    setTimerRunning(true);
    setIsPaused(false);
    setHasAlerted(false);
    lastUpdateRef.current = Date.now();
  }, [countdownTime, initialTime, setCountdownTime, setTimerRunning]);

  const handlePause = useCallback(() => {
    setTimerRunning(false);
    setIsPaused(true);
  }, [setTimerRunning]);

  const handleReset = useCallback(() => {
    resetCountdown();
    setHasAlerted(false);
    setIsPaused(false);
    countdownRef.current = initialTime * 1000;
    setDisplayMs(0);
  }, [resetCountdown, initialTime]);

  const progress = initialTime > 0 ? countdownTime / initialTime : 1;
  const circumference = 2 * Math.PI * 58; // r=58 (larger ring for bigger digits)
  const strokeDashoffset = circumference * (1 - progress);
  const isLowTime = countdownTime <= 5 && countdownTime > 0;

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Section Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm text-text-secondary font-semibold tracking-wide">
          Countdown
        </span>
        <span className="text-accent-cyan text-sm">↓</span>
      </div>

      {/* Timer Ring */}
      <div className="flex flex-col items-center justify-center mb-3">
        <div className={`relative ${isLowTime && isRunning ? 'animate-pulse' : ''}`}>
          <svg className="w-36 h-36 sm:w-40 sm:h-40 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="58"
              fill="none"
              stroke="currentColor"
              className="text-[rgba(255,255,255,0.4)]"
              strokeWidth="5"
            />
            <circle
              cx="50%"
              cy="50%"
              r="58"
              fill="none"
              stroke="currentColor"
              className={`transition-all duration-300 ${
                isLowTime
                  ? 'text-accent-coral'
                  : progress <= 0.1
                  ? 'text-accent-coral'
                  : 'text-accent-cyan'
              }`}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-3xl sm:text-4xl font-semibold tracking-wider ${
                isLowTime ? 'text-accent-coral' : 'text-text-primary'
              }`}
            >
              {formatCountdownMain(countdownTime)}
            </span>
            <span
              className={`text-sm tracking-wider ${
                isLowTime ? 'text-accent-coral/70' : 'text-text-muted'
              }`}
            >
              .{formatMilliseconds(isRunning ? displayMs : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Preset Grid - 2x2 on very small, 4 on larger */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mb-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset.seconds)}
            className="
              py-1.5 px-1 rounded-lg text-xs font-medium
              bg-[rgba(255,255,255,0.5)] border-2 border-[rgba(59,201,219,0.4)]
              text-text-secondary hover:text-text-primary
              hover:border-[rgba(59,201,219,0.6)] hover:bg-[rgba(255,255,255,0.7)]
              active:scale-95 transition-all
              shadow-[0_2px_4px_rgba(0,0,0,0.06)]
            "
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Compact Custom Input - constrained to prevent overflow */}
      <div className="flex gap-1.5 mb-3 max-w-full">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="MM:SS"
          className="
            w-16 min-w-0 px-2 py-1.5 rounded-lg
            bg-[rgba(255,255,255,0.8)] border-2 border-[rgba(59,201,219,0.4)]
            text-text-primary text-center text-sm font-medium
            focus:outline-none focus:ring-[3px] focus:ring-[rgba(59,201,219,0.3)]
            placeholder:text-text-muted
          "
          onKeyDown={(e) => e.key === 'Enter' && handleCustomSet()}
        />
        <button
          onClick={handleCustomSet}
          className="
            px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
            bg-[rgba(255,255,255,0.5)] border-2 border-[rgba(59,201,219,0.4)]
            text-text-secondary hover:text-text-primary
            hover:border-[rgba(59,201,219,0.6)] hover:bg-[rgba(255,255,255,0.7)]
            active:scale-95 transition-all
            shadow-[0_2px_4px_rgba(0,0,0,0.06)]
          "
        >
          Set
        </button>
      </div>

      {/* Controls - Start/Resume/Pause + Reset */}
      <div className="flex gap-1.5 mt-auto">
        {!isRunning ? (
          <GlassButton
            size="sm"
            variant="primary"
            onClick={handleStart}
            disabled={countdownTime === 0 && initialTime === 0}
            className="flex-1"
          >
            {isPaused ? 'Resume' : 'Start'}
          </GlassButton>
        ) : (
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handlePause}
            className="flex-1"
          >
            Pause
          </GlassButton>
        )}
        <GlassButton
          size="sm"
          variant="secondary"
          onClick={handleReset}
          disabled={countdownTime === initialTime && !isPaused}
          className="flex-1"
        >
          Reset
        </GlassButton>
      </div>
    </div>
  );
}

// Stopwatch Component (Compact version with milliseconds and pause)
function Stopwatch() {
  const { timer, setStopwatchTime, resetStopwatch } = useAppStore();
  const { stopwatchTime } = timer;
  const [localRunning, setLocalRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [displayMs, setDisplayMs] = useState(0);
  const stopwatchRef = useRef(stopwatchTime * 1000); // Store in milliseconds
  const lastUpdateRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref updated when stopwatchTime changes externally
  useEffect(() => {
    if (!localRunning && !isPaused) {
      stopwatchRef.current = stopwatchTime * 1000;
      setDisplayMs(0);
    }
  }, [stopwatchTime, localRunning, isPaused]);

  // Timer tick effect with millisecond precision
  useEffect(() => {
    if (!localRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    lastUpdateRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      const newTimeMs = stopwatchRef.current + delta;
      stopwatchRef.current = newTimeMs;

      // Update display milliseconds
      setDisplayMs(newTimeMs % 1000);

      // Update seconds in store (only when second changes)
      const newSeconds = Math.floor(newTimeMs / 1000);
      if (newSeconds !== stopwatchTime) {
        setStopwatchTime(newSeconds);
      }
    }, 50); // Update every 50ms for smooth millisecond display

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [localRunning, stopwatchTime, setStopwatchTime]);

  const handleStart = useCallback(() => {
    setLocalRunning(true);
    setIsPaused(false);
    lastUpdateRef.current = Date.now();
  }, []);

  const handlePause = useCallback(() => {
    setLocalRunning(false);
    setIsPaused(true);
  }, []);

  const handleReset = useCallback(() => {
    setLocalRunning(false);
    setIsPaused(false);
    stopwatchRef.current = 0;
    setDisplayMs(0);
    resetStopwatch();
  }, [resetStopwatch]);

  // Calculate progress (seconds in current minute)
  const totalMs = stopwatchRef.current;
  const secondsInMinute = (totalMs / 1000) % 60;
  const progress = secondsInMinute / 60;

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Section Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm text-text-secondary font-semibold tracking-wide">
          Stopwatch
        </span>
        <span className="text-accent-teal text-sm">↑</span>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center mb-3">
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0.5">
            <span className={`text-3xl sm:text-4xl font-semibold tracking-wider ${
              localRunning ? 'text-accent-teal' : isPaused ? 'text-accent-teal/70' : 'text-text-primary'
            }`}>
              {formatStopwatchMain(stopwatchTime)}
            </span>
            <span className={`text-base ${
              localRunning ? 'text-accent-teal/70' : 'text-text-muted'
            }`}>
              .{formatMilliseconds(localRunning || isPaused ? displayMs : 0)}
            </span>
          </div>
          {/* Seconds Progress Bar */}
          <GlassWell className="mt-2 h-1.5 overflow-hidden w-32 mx-auto">
            <div
              className={`h-full transition-all duration-100 rounded-full ${
                localRunning ? 'bg-gradient-to-r from-accent-cyan to-accent-teal' : 'bg-[rgba(255,255,255,0.5)]'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </GlassWell>
        </div>

        {/* Status indicator */}
        {(localRunning || isPaused) && (
          <div className="flex items-center gap-1.5 mt-3">
            <div className={`w-1.5 h-1.5 rounded-full ${
              localRunning ? 'bg-accent-teal animate-pulse' : 'bg-accent-teal/50'
            }`} />
            <span className={`text-[10px] font-medium ${
              localRunning ? 'text-accent-teal' : 'text-accent-teal/70'
            }`}>
              {localRunning ? 'Running' : 'Paused'}
            </span>
          </div>
        )}
      </div>

      {/* Controls - 3 buttons: Start/Pause/Reset */}
      <div className="flex gap-1.5 mt-auto">
        {!localRunning ? (
          <GlassButton
            size="sm"
            variant="primary"
            onClick={handleStart}
            className="flex-1"
          >
            {isPaused ? 'Resume' : 'Start'}
          </GlassButton>
        ) : (
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handlePause}
            className="flex-1"
          >
            Pause
          </GlassButton>
        )}
        <GlassButton
          size="sm"
          variant="secondary"
          onClick={handleReset}
          disabled={stopwatchTime === 0 && !isPaused}
          className="flex-1"
        >
          Reset
        </GlassButton>
      </div>
    </div>
  );
}

export function TimerPanel() {
  return (
    <GlassPanel variant="frosted" className="h-full">
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-text-primary">
            Timers
          </h2>
        </div>

        {/* Dual Timer Layout - responsive with overflow protection */}
        <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 min-w-0 overflow-hidden">
          {/* Countdown Section */}
          <div className="border-r border-[rgba(0,0,0,0.06)] pr-2 sm:pr-3 min-w-0 overflow-hidden">
            <CountdownTimer />
          </div>

          {/* Stopwatch Section */}
          <div className="pl-1 min-w-0 overflow-hidden">
            <Stopwatch />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
