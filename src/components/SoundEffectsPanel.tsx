'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { ConfigModal } from '@/components/ConfigModal';
import { useAppStore, type SoundEffectButton } from '@/stores/appStore';
import { useSound } from 'use-sound';
import { useState, useCallback, useEffect, useRef } from 'react';

interface SoundButtonProps {
  button: SoundEffectButton;
  volume: number;
}

// Tiny silent MP3 data URI
const SILENT_AUDIO = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNAAAAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQZB4P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';

// Individual sound button component with glass styling
function SoundButton({ button, volume }: SoundButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hasSound = button.soundFile && button.soundFile.length > 0;
  const volumeRef = useRef(volume);

  // Keep volume ref updated
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const soundPath = hasSound
    ? `/sounds/effects/${encodeURIComponent(button.soundFile)}`
    : SILENT_AUDIO;

  const [play, { stop, sound }] = useSound(soundPath, {
    volume: hasSound ? volume : 0,
    html5: true,
    onend: () => setIsPlaying(false),
    onplay: () => {
      setIsPlaying(true);
      // Ensure volume is set when sound starts playing
      if (sound) {
        sound.volume(volumeRef.current);
      }
    },
  });

  // Update volume when it changes (for already-initialized sounds)
  useEffect(() => {
    if (sound && hasSound) {
      sound.volume(volume);
    }
  }, [volume, sound, hasSound]);

  // Toggle play/stop behavior
  const handleClick = useCallback(() => {
    if (!hasSound) return;
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      // Set volume right before playing to ensure it's current
      if (sound) {
        sound.volume(volumeRef.current);
      }
      play();
    }
  }, [hasSound, isPlaying, play, stop, sound]);

  return (
    <button
      onClick={handleClick}
      disabled={!hasSound}
      className={`
        min-h-[72px] rounded-2xl font-medium
        text-text-primary transition-all duration-200
        relative overflow-hidden
        ${!hasSound
          ? 'bg-[rgba(255,255,255,0.3)] text-text-muted cursor-not-allowed opacity-60 border-[rgba(138,138,154,0.3)]'
          : isPlaying
            ? 'bg-[rgba(56,217,169,0.2)] backdrop-blur-sm hover:bg-[rgba(56,217,169,0.25)] active:scale-[0.98] border-accent-teal'
            : 'bg-[rgba(255,255,255,0.6)] backdrop-blur-sm hover:bg-[rgba(255,255,255,0.8)] active:scale-[0.98] border-[rgba(59,201,219,0.4)] hover:border-[rgba(59,201,219,0.6)]'
        }
        ${isPlaying ? 'ring-2 ring-accent-teal shadow-[0_0_20px_rgba(56,217,169,0.3)]' : ''}
        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        border-2
        disabled:shadow-none disabled:active:scale-100
      `}
    >
      <div className="flex flex-col items-center justify-center gap-1 p-2">
        {/* Button indicator dot */}
        <div className={`
          w-2 h-2 rounded-full transition-colors
          ${hasSound ? 'bg-accent-teal' : 'bg-text-muted'}
        `} />
        {/* Button name */}
        <span className="text-sm font-medium leading-tight text-center">
          {button.name}
        </span>
        {/* Unassigned indicator */}
        {!hasSound && (
          <span className="text-xs text-text-muted">
            No sound
          </span>
        )}
      </div>

      {/* Playing animation */}
      {isPlaying && (
        <div className="absolute inset-0 bg-accent-teal/10 animate-pulse" />
      )}
    </button>
  );
}

export function SoundEffectsPanel() {
  const { soundEffectButtons, effectsVolume, setEffectsVolume } = useAppStore();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <GlassPanel variant="frosted" className="h-full">
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-text-primary">
              Sound Effects
            </h2>
            <div className="flex items-center gap-2">
              <GlassButton
                size="sm"
                variant="primary"
                onClick={() => setIsConfigOpen(true)}
              >
                Configure
              </GlassButton>
            </div>
          </div>

          {/* Sound Buttons Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
            {soundEffectButtons.map((button) => (
              <SoundButton
                key={`${button.id}-${button.soundFile}`}
                button={button}
                volume={effectsVolume}
              />
            ))}
          </div>

          {/* Volume Control */}
          <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              {/* Volume icon */}
              <svg
                className="w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>

              {/* Volume slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effectsVolume}
                onChange={(e) => setEffectsVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 cursor-pointer"
              />

              {/* Volume percentage */}
              <span className="text-sm text-text-secondary font-medium min-w-[3rem] text-right">
                {Math.round(effectsVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </>
  );
}
