'use client';

import { GlassPanel, GlassWell } from '@/components/ui/GlassPanel';
import { useAppStore, type DiceRoll } from '@/stores/appStore';
import { useSound } from 'use-sound';
import { useCallback, useState } from 'react';

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

// Generate random dice roll (1-6)
function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
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
      <span className="text-4xl sm:text-5xl text-text-muted animate-blur">?</span>
    );
  }

  return (
    <>
      {dots.map((pos, idx) => (
        <div
          key={idx}
          className={`
            absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full
            ${dotColor}
            shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]
            ${POSITION_CLASSES[pos]}
          `}
        />
      ))}
    </>
  );
}

// Animated Die Component
function AnimatedDie({ value, isRolling }: { value: number; isRolling: boolean }) {
  return (
    <div
      className={`
        relative w-20 h-20 sm:w-24 sm:h-24
        bg-[#f5f0e6] rounded-2xl
        shadow-[0_6px_12px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1)]
        border-2 border-[#e0dbd0]
        transition-all duration-150
        ${isRolling ? 'animate-shake' : ''}
      `}
    >
      <DiceFace value={value} isRolling={isRolling} />
    </div>
  );
}

export function DicePanel() {
  const { diceRolls, addDiceRoll, clearDiceHistory } = useAppStore();
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [sum, setSum] = useState(2);

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
      const [d1, d2] = rollDice();
      setDice1(d1);
      setDice2(d2);
      setSum(d1 + d2);
      setIsRolling(false);

      // Add to history
      addDiceRoll({
        id: generateId(),
        dice1: d1,
        dice2: d2,
        sum: d1 + d2,
        timestamp: Date.now(),
      });
    }, 500);
  }, [isRolling, playRollSound, addDiceRoll]);

  const handleClearHistory = useCallback(() => {
    clearDiceHistory();
  }, [clearDiceHistory]);

  // Get last roll (most recent) for display
  const lastRoll = diceRolls[0];

  return (
    <GlassPanel variant="frosted" className="h-full">
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-text-primary">
            Dice
          </h2>
          {diceRolls.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs font-medium text-text-muted hover:text-accent-coral transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dice Area - Tap to roll */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`
            flex-1 min-h-[160px] flex items-center justify-center gap-6 sm:gap-10
            bg-[rgba(255,255,255,0.4)] rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.6)]
            hover:border-accent-teal/50 hover:bg-[rgba(255,255,255,0.5)]
            transition-all duration-150 cursor-pointer will-change-transform
            disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
            ${!isRolling ? 'active:scale-[0.98]' : ''}
          `}
        >
          <AnimatedDie value={dice1} isRolling={isRolling} />
          <AnimatedDie value={dice2} isRolling={isRolling} />
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
            <div className="space-y-1 overflow-y-auto max-h-[120px]">
              {diceRolls.map((roll) => (
                <div
                  key={roll.id}
                  className="flex items-center justify-between py-1 px-2 rounded-lg bg-[rgba(255,255,255,0.4)] text-text-secondary text-xs"
                >
                  <span>
                    <span className={roll.dice1 === 1 || roll.dice1 === 4 ? 'text-[#FF0000] font-bold' : 'text-[#0000ff] font-bold'}>
                      {roll.dice1}
                    </span>
                    {' + '}
                    <span className={roll.dice2 === 1 || roll.dice2 === 4 ? 'text-[#FF0000] font-bold' : 'text-[#0000ff] font-bold'}>
                      {roll.dice2}
                    </span>
                    {' = '}
                    <span className="text-accent-teal font-semibold ml-1">{roll.sum}</span>
                  </span>
                  <span className="text-text-muted">{formatTimestamp(roll.timestamp)}</span>
                </div>
              ))}
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
