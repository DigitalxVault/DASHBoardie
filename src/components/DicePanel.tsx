'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAppStore, type DiceRoll } from '@/stores/appStore';
import { useSound } from 'use-sound';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Settings, Minus, Plus, X } from 'lucide-react';

// Dot positions for each dice value (1-6)
// Grid positions: tl=top-left, tc=top-center, tr=top-right, ml=mid-left, mc=mid-center, mr=mid-right, bl=bot-left, bc=bot-center, br=bot-right
const DOT_POSITIONS: Record<number, string[]> = {
  1: ['mc'],
  2: ['tl', 'br'],
  3: ['tl', 'mc', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'mc', 'bl', 'br'],
  6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'],
};

// Position classes for dots in a 3x3 grid
const POSITION_CLASSES: Record<string, string> = {
  tl: 'top-1.5 left-1.5',
  tc: 'top-1.5 left-1/2 -translate-x-1/2',
  tr: 'top-1.5 right-1.5',
  ml: 'top-1/2 left-1.5 -translate-y-1/2',
  mc: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  mr: 'top-1/2 right-1.5 -translate-y-1/2',
  bl: 'bottom-1.5 left-1.5',
  bc: 'bottom-1.5 left-1/2 -translate-x-1/2',
  br: 'bottom-1.5 right-1.5',
};

// Generate random dice rolls
function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format timestamp for display
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

// Dice Face Component - renders dots based on value
function DiceFace({ value, isRolling }: { value: number; isRolling: boolean }) {
  const dots = DOT_POSITIONS[value] || [];
  // Red dots for 1 and 4, Blue dots for 2, 3, 5, 6
  const isRedDots = value === 1 || value === 4;
  const dotColor = isRedDots ? 'bg-[#FF0000]' : 'bg-[#0000ff]';

  if (isRolling) {
    return (
      <span className="text-3xl sm:text-4xl text-text-muted animate-blur">?</span>
    );
  }

  return (
    <>
      {dots.map((pos, idx) => (
        <div
          key={idx}
          className={`
            absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full
            ${dotColor}
            shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]
            ${POSITION_CLASSES[pos]}
          `}
        />
      ))}
    </>
  );
}

// Animated Die Component - smaller size to fit more dice
function AnimatedDie({ value, isRolling, size = 'normal' }: { value: number; isRolling: boolean; size?: 'small' | 'normal' }) {
  const sizeClasses = size === 'small'
    ? 'w-14 h-14 sm:w-16 sm:h-16'
    : 'w-16 h-16 sm:w-20 sm:h-20';

  return (
    <div
      className={`
        relative ${sizeClasses}
        bg-[#f5f0e6] rounded-xl
        shadow-[0_4px_8px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1)]
        border-2 border-[#e0dbd0]
        transition-all duration-150
        ${isRolling ? 'animate-shake' : ''}
      `}
    >
      <DiceFace value={value} isRolling={isRolling} />
    </div>
  );
}

// Settings Popover Component
function SettingsPopover({
  isOpen,
  onClose,
  diceCount,
  onDiceCountChange
}: {
  isOpen: boolean;
  onClose: () => void;
  diceCount: number;
  onDiceCountChange: (count: number) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 z-50 rounded-xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(30,30,50,0.95)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.15)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 min-w-[200px]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#2A2A3A] dark:text-[#F5F5FA]">Dice Settings</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-[#6A6A7A] dark:text-[#9A9AAA]" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA] font-medium">
            Number of Dice
          </label>
          <div className="flex items-center gap-3 mt-2">
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => onDiceCountChange(diceCount - 1)}
              disabled={diceCount <= 1}
              className="!p-2"
            >
              <Minus className="w-4 h-4" />
            </GlassButton>
            <span className="text-lg font-bold text-[#2A2A3A] dark:text-[#F5F5FA] min-w-[2rem] text-center">
              {diceCount}
            </span>
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => onDiceCountChange(diceCount + 1)}
              disabled={diceCount >= 6}
              className="!p-2"
            >
              <Plus className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DicePanel() {
  const { diceRolls, addDiceRoll, clearDiceHistory, diceCount, setDiceCount } = useAppStore();
  const [diceValues, setDiceValues] = useState<number[]>(() => Array(diceCount).fill(1));
  const [isRolling, setIsRolling] = useState(false);
  const [sum, setSum] = useState(diceCount);
  const [showSettings, setShowSettings] = useState(false);

  // Update dice values array when dice count changes
  useEffect(() => {
    setDiceValues(prev => {
      if (prev.length === diceCount) return prev;
      if (prev.length < diceCount) {
        return [...prev, ...Array(diceCount - prev.length).fill(1)];
      }
      return prev.slice(0, diceCount);
    });
    setSum(diceCount); // Reset sum to default
  }, [diceCount]);

  // Roll sound effect - using available sound file
  const [playRollSound] = useSound('/sounds/effects/Roll%20Dice.mp3', {
    volume: 1.0,
    html5: true,
  });

  // Handle roll
  const handleRoll = useCallback(() => {
    if (isRolling) return;

    // Play sound
    playRollSound();

    // Start rolling animation
    setIsRolling(true);

    // Generate results after animation
    setTimeout(() => {
      const newValues = rollDice(diceCount);
      const newSum = newValues.reduce((a, b) => a + b, 0);
      setDiceValues(newValues);
      setSum(newSum);
      setIsRolling(false);

      // Add to history (with backward compatibility)
      addDiceRoll({
        id: generateId(),
        dice1: newValues[0] || 0,
        dice2: newValues[1] || 0,
        diceValues: newValues,
        sum: newSum,
        timestamp: Date.now(),
      });
    }, 500);
  }, [isRolling, playRollSound, addDiceRoll, diceCount]);

  const handleClearHistory = useCallback(() => {
    clearDiceHistory();
  }, [clearDiceHistory]);

  // Determine dice size based on count
  const diceSize = diceCount > 3 ? 'small' : 'normal';

  // Get dice values for a roll (backward compatible)
  const getRollValues = (roll: DiceRoll): number[] => {
    if (roll.diceValues) return roll.diceValues;
    return [roll.dice1, roll.dice2];
  };

  return (
    <GlassPanel variant="frosted" className="h-full">
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(0,0,0,0.06)] relative">
          <h2 className="text-lg font-semibold text-text-primary">
            Dice
          </h2>
          <div className="flex items-center gap-2">
            {diceRolls.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs font-medium text-text-muted hover:text-accent-coral transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Dice Settings"
            >
              <Settings className="w-4 h-4 text-[#6A6A7A] dark:text-[#9A9AAA]" />
            </button>
          </div>
          <SettingsPopover
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            diceCount={diceCount}
            onDiceCountChange={setDiceCount}
          />
        </div>

        {/* Dice Area - Tap to roll */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`
            flex-1 min-h-[140px] flex items-center justify-center gap-3 sm:gap-4 flex-wrap p-4
            bg-[rgba(255,255,255,0.4)] rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.6)]
            hover:border-accent-teal/50 hover:bg-[rgba(255,255,255,0.5)]
            transition-all duration-150 cursor-pointer will-change-transform
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
            ${!isRolling ? 'active:scale-[0.98]' : ''}
          `}
        >
          {diceValues.map((value, index) => (
            <AnimatedDie key={index} value={value} isRolling={isRolling} size={diceSize} />
          ))}
        </button>

        {/* Sum Display */}
        <div className="text-center py-2">
          <span className="text-sm text-text-secondary font-semibold tracking-wide">
            Sum
          </span>
          <div className="text-3xl sm:text-4xl font-semibold text-accent-teal">
            {isRolling ? '-' : sum}
          </div>
        </div>

        {/* Roll History */}
        <div className="flex-1 overflow-hidden">
          <div className="text-sm text-text-secondary font-semibold tracking-wide mb-2">
            Recent Rolls
          </div>
          {diceRolls.length === 0 ? (
            <div className="text-center text-text-muted py-4">
              No rolls yet
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-[100px]">
              {diceRolls.map((roll) => {
                const values = getRollValues(roll);
                return (
                  <div
                    key={roll.id}
                    className="flex items-center justify-between py-1 px-2 rounded-lg bg-[rgba(255,255,255,0.4)] text-text-secondary text-xs"
                  >
                    <span>
                      {values.map((v, i) => (
                        <span key={i}>
                          {i > 0 && ' + '}
                          <span className={v === 1 || v === 4 ? 'text-[#FF0000] font-bold' : 'text-[#0000ff] font-bold'}>
                            {v}
                          </span>
                        </span>
                      ))}
                      {' = '}
                      <span className="text-accent-teal font-semibold ml-1">{roll.sum}</span>
                    </span>
                    <span className="text-text-muted">{formatTimestamp(roll.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes blur {
          0%, 100% { filter: blur(0); }
          50% { filter: blur(4px); }
        }
        .animate-shake {
          animation: shake 0.1s ease-in-out 5;
        }
        .animate-blur {
          animation: blur 0.5s ease-in-out infinite;
        }
      `}</style>
    </GlassPanel>
  );
}
