'use client';

import { GlassPanel, GlassWell } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAppStore } from '@/stores/appStore';
import { useCallback, useEffect, useRef } from 'react';
import { audioManifest } from '@/generated/audio-manifest';

// Available background tracks - auto-generated from public/sounds/background/
const AVAILABLE_TRACKS = audioManifest.background;

// Helper to format filename for display
function formatTrackName(filename: string): string {
  return filename.replace(/\.mp3$/i, '');
}

// Format time as M:SS
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Inner player component
interface MusicPlayerProps {
  track: string;
  volume: number;
  isPlaying: boolean;
  loop: boolean;
  onPlayingChange: (playing: boolean) => void;
  onDurationChange: (duration: number) => void;
  onProgressChange: (progress: number) => void;
  progress: number;
  duration: number;
}

function MusicPlayer({
  track,
  volume,
  isPlaying,
  loop,
  onPlayingChange,
  onDurationChange,
  onProgressChange,
  progress,
  duration,
}: MusicPlayerProps) {
  const progressRef = useRef(progress);
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const durationInSeconds = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Create and manage audio element directly for full control
  useEffect(() => {
    const soundPath = `/sounds/background/${encodeURIComponent(track)}`;
    const audio = new Audio(soundPath);
    audioRef.current = audio;

    // Set initial volume (clamped for safety)
    audio.volume = Math.max(0, Math.min(1, volume));

    // Get duration when metadata loads
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration) {
        durationInSeconds.current = audio.duration;
        onDurationChange(audio.duration);
      }
    });

    // Handle track ending
    audio.addEventListener('ended', () => {
      if (!loop) {
        onPlayingChange(false);
        onProgressChange(0);
      } else {
        // For loop, restart the track
        audio.currentTime = 0;
        audio.play();
      }
    });

    // Handle play/pause state changes
    audio.addEventListener('play', () => onPlayingChange(true));
    audio.addEventListener('pause', () => {
      // Only mark as not playing if we didn't just end the track
      if (audio.currentTime > 0 && audio.currentTime < audio.duration) {
        onPlayingChange(false);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, loop]);

  // Handle play/pause based on isPlaying state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Always ensure volume is set before playing
    audio.volume = volume;

    if (isPlaying) {
      audio.play().catch(() => {
        // Auto-play blocked or other error
        onPlayingChange(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, volume, onPlayingChange]);

  // Handle volume changes - ensure volume is clamped and applied
  useEffect(() => {
    if (audioRef.current) {
      // Clamp volume between 0 and 1 for safety
      const clampedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = clampedVolume;
    }
  }, [volume]);

  // Progress tracking interval
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
        progressUpdateRef.current = null;
      }
      return;
    }

    progressUpdateRef.current = setInterval(() => {
      if (audio.duration) {
        const currentProgress = audio.currentTime / audio.duration;
        progressRef.current = currentProgress;
        onProgressChange(currentProgress);
      }
    }, 100);

    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
    };
  }, [isPlaying, onProgressChange]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    onProgressChange(0);
  }, [onProgressChange]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newProgress = parseFloat(e.target.value);
    progressRef.current = newProgress;
    onProgressChange(newProgress);

    // Seek the audio
    if (audio.duration) {
      audio.currentTime = newProgress * audio.duration;
    }
  }, [onProgressChange]);

  // Use duration from props (already in seconds)
  const displayDuration = duration;
  const currentTime = displayDuration ? progress * displayDuration : 0;
  const progressPercent = progress * 100;

  return (
    <>
      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <GlassButton
          size="md"
          variant="primary"
          onClick={handlePlayPause}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </GlassButton>
        <GlassButton
          size="md"
          variant="secondary"
          onClick={handleStop}
          disabled={!isPlaying && progress === 0}
        >
          Stop
        </GlassButton>
      </div>

      {/* Progress Bar with Seek */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary font-medium">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-text-secondary font-medium">
            {formatTime(displayDuration)}
          </span>
        </div>
        <div className="relative">
          {/* Background track */}
          <GlassWell className="h-2 overflow-hidden absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-accent-teal transition-all duration-100 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </GlassWell>
          {/* Interactive slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 cursor-pointer relative z-10 opacity-0 hover:opacity-100"
            style={{ background: 'transparent' }}
          />
        </div>
      </div>
    </>
  );
}

// Placeholder when no track selected
function NoTrackPlaceholder() {
  return (
    <>
      <div className="flex items-center justify-center gap-3 mb-4">
        <GlassButton size="md" variant="secondary" disabled>
          Play
        </GlassButton>
        <GlassButton size="md" variant="secondary" disabled>
          Stop
        </GlassButton>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted font-medium">0:00</span>
          <span className="text-xs text-text-muted font-medium">0:00</span>
        </div>
        <GlassWell className="h-2" />
      </div>
    </>
  );
}

export function BackgroundMusic() {
  const {
    musicPlayback,
    musicVolume,
    setMusicVolume,
    setMusicPlaying,
    setCurrentTrack,
    setMusicProgress,
    setMusicDuration,
    setMusicLoop,
  } = useAppStore();

  const { currentTrack, isPlaying, progress, loop } = musicPlayback;

  const handleTrackChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTrack = e.target.value;
      setMusicProgress(0);
      setMusicDuration(0);
      setMusicPlaying(false);
      setCurrentTrack(newTrack);
    },
    [setCurrentTrack, setMusicPlaying, setMusicProgress, setMusicDuration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMusicVolume(parseFloat(e.target.value));
    },
    [setMusicVolume]
  );

  const handleLoopChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMusicLoop(e.target.checked);
    },
    [setMusicLoop]
  );

  const hasTrack = currentTrack && currentTrack.length > 0;

  return (
    <GlassPanel variant="frosted" className="h-full">
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-text-primary">
            Background Music
          </h2>
          <div className="flex items-center gap-2">
            {isPlaying && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-3 bg-accent-teal rounded-full animate-pulse" />
                <span className="text-xs text-accent-teal font-medium">
                  Playing
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Track Selection */}
        <div className="mb-4">
          <label className="text-xs text-text-muted font-medium block mb-2">
            Select Track
          </label>
          <select
            value={currentTrack}
            onChange={handleTrackChange}
            className="
              w-full px-3 py-2.5 rounded-xl
              bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.9)]
              text-text-primary font-medium
              focus:outline-none focus:ring-[3px] focus:ring-[rgba(59,201,219,0.3)]
              cursor-pointer
            "
          >
            <option value="">No track selected</option>
            {AVAILABLE_TRACKS.map((track) => (
              <option key={track} value={track}>
                {formatTrackName(track)}
              </option>
            ))}
          </select>
        </div>

        {/* Loop Checkbox */}
        <div className="flex items-center gap-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={loop}
              onChange={handleLoopChange}
            />
            <span className="text-sm text-text-secondary font-medium">
              Loop Track
            </span>
          </label>
        </div>

        {/* Music Player */}
        {hasTrack ? (
          <MusicPlayer
            key={`${currentTrack}-${loop}`}
            track={currentTrack}
            volume={musicVolume}
            isPlaying={isPlaying}
            loop={loop}
            onPlayingChange={setMusicPlaying}
            onDurationChange={setMusicDuration}
            onProgressChange={setMusicProgress}
            progress={progress}
            duration={musicPlayback.duration}
          />
        ) : (
          <NoTrackPlaceholder />
        )}

        {/* Volume Control */}
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)] mt-auto">
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
              value={musicVolume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 cursor-pointer"
            />

            {/* Volume percentage */}
            <span className="text-sm text-text-secondary font-medium min-w-[3rem] text-right">
              {Math.round(musicVolume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
