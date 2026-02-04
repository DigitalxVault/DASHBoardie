import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Sound effect button configuration
export interface SoundEffectButton {
  id: string
  name: string
  soundFile: string
}

// ElevenLabs voice configuration
export interface ElevenLabsVoice {
  id: string
  name: string
  voiceId: string
}

// Voice generator state (persisted)
interface VoiceGeneratorState {
  voices: ElevenLabsVoice[]
  selectedVoiceId: string | null
}

// Music playback state (loop is persisted, others are runtime)
interface MusicPlaybackState {
  isPlaying: boolean
  currentTrack: string
  progress: number // 0-1
  duration: number // in seconds
  loop: boolean // whether to loop the track
}

// Timer state (not persisted)
export type TimerMode = 'countdown' | 'stopwatch'

interface TimerState {
  mode: TimerMode
  countdownTime: number // seconds remaining
  stopwatchTime: number // seconds elapsed
  isRunning: boolean
  initialTime: number // for countdown reset
}

// Progress bar state (persisted)
interface ProgressBarState {
  value: number      // 0-100
  increment: number  // step size (default: 10)
  color: string      // hex color for progress bar
}

// Dice roll state
export interface DiceRoll {
  id: string
  dice1: number // 1-6 (legacy, kept for backward compatibility)
  dice2: number // 1-6 (legacy, kept for backward compatibility)
  diceValues?: number[] // Array of dice values (1-6 each)
  sum: number
  timestamp: number
}

// Theme type (persisted)
export type Theme = 'light' | 'dark'

interface AppState {
  // Theme preference (persisted)
  theme: Theme

  // Volume preferences (persisted)
  musicVolume: number
  effectsVolume: number

  // Sound effect buttons (10 configurable buttons, persisted)
  soundEffectButtons: SoundEffectButton[]

  // Music playback state (NOT persisted - runtime only)
  musicPlayback: MusicPlaybackState

  // Timer state (NOT persisted - runtime only)
  timer: TimerState

  // Dice rolls (persisted - last 5 rolls)
  diceRolls: DiceRoll[]

  // Dice configuration (persisted)
  diceCount: number // 1-6 dice

  // Progress bar state (persisted)
  progressBar: ProgressBarState

  // Voice generator state (persisted)
  voiceGenerator: VoiceGeneratorState

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setMusicVolume: (volume: number) => void
  setEffectsVolume: (volume: number) => void
  updateSoundEffectButton: (id: string, updates: Partial<SoundEffectButton>) => void
  resetSoundEffectButtons: () => void

  // Music playback actions (loop is persisted)
  setMusicPlaying: (playing: boolean) => void
  setCurrentTrack: (track: string) => void
  setMusicProgress: (progress: number) => void
  setMusicDuration: (duration: number) => void
  setMusicLoop: (loop: boolean) => void
  resetMusicPlayback: () => void

  // Timer actions (not persisted)
  setTimerMode: (mode: TimerMode) => void
  setCountdownTime: (time: number) => void
  setStopwatchTime: (time: number) => void
  setTimerRunning: (running: boolean) => void
  resetCountdown: () => void
  resetStopwatch: () => void
  setTimerInitialTime: (time: number) => void

  // Dice actions
  addDiceRoll: (roll: DiceRoll) => void
  clearDiceHistory: () => void
  setDiceCount: (count: number) => void

  // Progress bar actions
  setProgressBarValue: (value: number) => void
  setProgressBarIncrement: (increment: number) => void
  setProgressBarColor: (color: string) => void
  incrementProgress: () => void
  decrementProgress: () => void

  // Voice generator actions
  addVoice: (voice: ElevenLabsVoice) => void
  updateVoice: (id: string, updates: Partial<ElevenLabsVoice>) => void
  removeVoice: (id: string) => void
  setSelectedVoice: (voiceId: string | null) => void
}

// Default sound effect buttons
const defaultSoundEffectButtons: SoundEffectButton[] = Array.from(
  { length: 10 },
  (_, i) => ({
    id: `effect-${i + 1}`,
    name: `Effect ${i + 1}`,
    soundFile: '',
  })
)

// Default music playback state
const defaultMusicPlayback: MusicPlaybackState = {
  isPlaying: false,
  currentTrack: '',
  progress: 0,
  duration: 0,
  loop: true, // Default to looping
}

// Default timer state
const defaultTimer: TimerState = {
  mode: 'countdown',
  countdownTime: 0,
  stopwatchTime: 0,
  isRunning: false,
  initialTime: 0,
}

// Default progress bar state
const defaultProgressBar: ProgressBarState = {
  value: 0,
  increment: 10,
  color: '#FF6B6B',
}

// Default voice generator state
const defaultVoiceGenerator: VoiceGeneratorState = {
  voices: [],
  selectedVoiceId: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Default theme
      theme: 'light' as Theme,

      // Default volume values
      musicVolume: 0.5,
      effectsVolume: 0.7,

      // Default sound effect buttons
      soundEffectButtons: defaultSoundEffectButtons,

      // Default music playback (runtime only)
      musicPlayback: defaultMusicPlayback,

      // Default timer (runtime only)
      timer: defaultTimer,

      // Default dice rolls (empty array)
      diceRolls: [],

      // Default dice count
      diceCount: 2,

      // Default progress bar
      progressBar: defaultProgressBar,

      // Default voice generator
      voiceGenerator: defaultVoiceGenerator,

      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      // Volume actions
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      setEffectsVolume: (volume) => set({ effectsVolume: volume }),

      // Sound effect button actions
      updateSoundEffectButton: (id, updates) =>
        set((state) => ({
          soundEffectButtons: state.soundEffectButtons.map((btn) =>
            btn.id === id ? { ...btn, ...updates } : btn
          ),
        })),

      resetSoundEffectButtons: () =>
        set({ soundEffectButtons: defaultSoundEffectButtons }),

      // Music playback actions (not persisted)
      setMusicPlaying: (playing) =>
        set((state) => ({
          musicPlayback: { ...state.musicPlayback, isPlaying: playing },
        })),

      setCurrentTrack: (track) =>
        set((state) => ({
          musicPlayback: { ...state.musicPlayback, currentTrack: track, progress: 0 },
        })),

      setMusicProgress: (progress) =>
        set((state) => ({
          musicPlayback: { ...state.musicPlayback, progress },
        })),

      setMusicDuration: (duration) =>
        set((state) => ({
          musicPlayback: { ...state.musicPlayback, duration },
        })),

      setMusicLoop: (loop) =>
        set((state) => ({
          musicPlayback: { ...state.musicPlayback, loop },
        })),

      resetMusicPlayback: () =>
        set({ musicPlayback: defaultMusicPlayback }),

      // Timer actions (not persisted)
      setTimerMode: (mode) =>
        set((state) => ({
          timer: { ...defaultTimer, mode },
        })),

      setCountdownTime: (time) =>
        set((state) => ({
          timer: { ...state.timer, countdownTime: time },
        })),

      setStopwatchTime: (time) =>
        set((state) => ({
          timer: { ...state.timer, stopwatchTime: time },
        })),

      setTimerRunning: (running) =>
        set((state) => ({
          timer: { ...state.timer, isRunning: running },
        })),

      resetCountdown: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            countdownTime: state.timer.initialTime,
            isRunning: false,
          },
        })),

      resetStopwatch: () =>
        set((state) => ({
          timer: {
            ...state.timer,
            stopwatchTime: 0,
            isRunning: false,
          },
        })),

      setTimerInitialTime: (time) =>
        set((state) => ({
          timer: { ...state.timer, initialTime: time, countdownTime: time },
        })),

      // Dice actions
      addDiceRoll: (roll) =>
        set((state) => ({
          diceRolls: [roll, ...state.diceRolls].slice(0, 5), // Keep only last 5
        })),

      clearDiceHistory: () =>
        set({ diceRolls: [] }),

      setDiceCount: (count) =>
        set({ diceCount: Math.max(1, Math.min(6, count)) }),

      // Progress bar actions
      setProgressBarValue: (value) =>
        set((state) => ({
          progressBar: { ...state.progressBar, value: Math.max(0, Math.min(100, value)) },
        })),

      setProgressBarIncrement: (increment) =>
        set((state) => ({
          progressBar: { ...state.progressBar, increment: Math.max(1, Math.min(50, increment)) },
        })),

      setProgressBarColor: (color) =>
        set((state) => ({
          progressBar: { ...state.progressBar, color },
        })),

      incrementProgress: () =>
        set((state) => ({
          progressBar: {
            ...state.progressBar,
            value: Math.min(100, state.progressBar.value + state.progressBar.increment),
          },
        })),

      decrementProgress: () =>
        set((state) => ({
          progressBar: {
            ...state.progressBar,
            value: Math.max(0, state.progressBar.value - state.progressBar.increment),
          },
        })),

      // Voice generator actions
      addVoice: (voice) =>
        set((state) => ({
          voiceGenerator: {
            ...state.voiceGenerator,
            voices: [...state.voiceGenerator.voices, voice],
          },
        })),

      updateVoice: (id, updates) =>
        set((state) => ({
          voiceGenerator: {
            ...state.voiceGenerator,
            voices: state.voiceGenerator.voices.map((v) =>
              v.id === id ? { ...v, ...updates } : v
            ),
          },
        })),

      removeVoice: (id) =>
        set((state) => ({
          voiceGenerator: {
            ...state.voiceGenerator,
            voices: state.voiceGenerator.voices.filter((v) => v.id !== id),
            selectedVoiceId:
              state.voiceGenerator.selectedVoiceId === id
                ? null
                : state.voiceGenerator.selectedVoiceId,
          },
        })),

      setSelectedVoice: (voiceId) =>
        set((state) => ({
          voiceGenerator: { ...state.voiceGenerator, selectedVoiceId: voiceId },
        })),
    }),
    {
      name: 'dashboardie-storage',
      storage: createJSONStorage(() => {
        // Lazy access to localStorage only on client-side
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        // Return a dummy storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          get length() { return 0; },
          clear: () => {},
          key: () => null,
        } as Storage;
      }),
      // Persist theme, volume settings, button configurations, and dice history
      // Music playback and timer state are runtime-only (resets on page load)
      partialize: (state) => ({
        theme: state.theme,
        musicVolume: state.musicVolume,
        effectsVolume: state.effectsVolume,
        soundEffectButtons: state.soundEffectButtons,
        diceRolls: state.diceRolls,
        diceCount: state.diceCount,
        progressBar: state.progressBar,
        voiceGenerator: state.voiceGenerator,
      }),
      skipHydration: true,
    }
  )
)
