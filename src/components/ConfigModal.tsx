'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAppStore } from '@/stores/appStore';
import { type SoundEffectButton } from '@/stores/appStore';
import { useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { audioManifest } from '@/generated/audio-manifest';

// Available sound files - auto-generated from public/sounds/effects/
const AVAILABLE_SOUNDS = audioManifest.effects;

// Helper to format filename for display (removes .mp3 extension)
function formatSoundName(filename: string): string {
  return filename.replace(/\.mp3$/i, '');
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ButtonConfigRowProps {
  button: SoundEffectButton;
  onUpdate: (id: string, updates: Partial<SoundEffectButton>) => void;
  index: number;
}

function ButtonConfigRow({ button, onUpdate, index }: ButtonConfigRowProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(button.id, { name: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(button.id, { soundFile: e.target.value });
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(60,60,80,0.5)]">
      {/* Button number */}
      <span className="text-sm text-text-secondary font-semibold min-w-[2rem]">
        #{index + 1}
      </span>

      {/* Name input */}
      <input
        type="text"
        value={button.name}
        onChange={handleNameChange}
        className="
          flex-1 min-w-0 px-3 py-2 rounded-lg
          bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(40,40,60,0.8)]
          border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)]
          text-text-primary text-sm font-medium
          focus:outline-none focus:ring-[3px] focus:ring-[rgba(59,201,219,0.3)]
          placeholder:text-text-muted
        "
        placeholder={`Effect ${index + 1}`}
      />

      {/* File dropdown */}
      <select
        value={button.soundFile}
        onChange={handleFileChange}
        className="
          px-3 py-2 rounded-lg min-w-[140px]
          bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(40,40,60,0.8)]
          border border-[rgba(255,255,255,0.9)] dark:border-[rgba(255,255,255,0.15)]
          text-text-primary text-sm font-medium
          focus:outline-none focus:ring-[3px] focus:ring-[rgba(59,201,219,0.3)]
          cursor-pointer
        "
      >
        <option value="">None</option>
        {AVAILABLE_SOUNDS.map((sound) => (
          <option key={sound} value={sound}>
            {formatSoundName(sound)}
          </option>
        ))}
      </select>

      {/* Assigned indicator */}
      <div className={`
        w-2 h-2 rounded-full
        ${button.soundFile ? 'bg-accent-teal' : 'bg-text-muted'}
      `} />
    </div>
  );
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { soundEffectButtons, updateSoundEffectButton, resetSoundEffectButtons } = useAppStore();

  const handleReset = useCallback(() => {
    if (confirm('Reset all buttons to defaults? This cannot be undone.')) {
      resetSoundEffectButtons();
    }
  }, [resetSoundEffectButtons]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Escape key closes modal
  useMemo(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <GlassPanel variant="frosted" padding="none" className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Configure Sound Effects
            </h2>
            <p className="text-sm text-text-secondary font-medium">
              Edit button names and assign audio files
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.5)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Button List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {soundEffectButtons.map((button, index) => (
            <ButtonConfigRow
              key={button.id}
              button={button}
              onUpdate={updateSoundEffectButton}
              index={index}
            />
          ))}
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.3)]">
          <GlassButton
            size="sm"
            variant="danger"
            onClick={handleReset}
          >
            Reset All
          </GlassButton>

          <div className="flex gap-3">
            <GlassButton
              size="md"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </GlassButton>
            <GlassButton
              size="md"
              variant="primary"
              onClick={onClose}
            >
              Save & Close
            </GlassButton>
          </div>
        </div>
      </GlassPanel>
    </div>
  );

  // Portal to body so it's outside any CSS transforms from block scaling
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
