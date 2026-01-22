import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Sound effect button configuration
export interface SoundEffectButton {
  id: string
  name: string
  soundFile: string
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

// Dice roll state
export interface DiceRoll {
  id: string
  dice1: number // 1-6
  dice2: number // 1-6
  sum: number // 2-12
  timestamp: number
}

interface AppState {
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

  // Actions
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

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'lofi-storage',
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
      // Persist volume settings, button configurations, and dice history
      // Music playback and timer state are runtime-only (resets on page load)
      partialize: (state) => ({
        musicVolume: state.musicVolume,
        effectsVolume: state.effectsVolume,
        soundEffectButtons: state.soundEffectButtons,
        diceRolls: state.diceRolls,
      }),
      skipHydration: true,
    }
  )
)
