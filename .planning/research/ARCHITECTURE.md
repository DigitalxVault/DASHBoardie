# Architecture Research: Audio Soundboard + Timer App

**Project:** LoFi Immersive Interface
**Researched:** 2026-01-21
**Confidence:** HIGH (verified with MDN, library docs, community patterns)

## Executive Summary

This document defines the component architecture, state management, audio handling, and build order for a React/Next.js board game control panel featuring dice, timers, background music, and configurable sound effect buttons.

**Key architectural decisions:**
1. Single AudioContext shared via React Context (browser requirement)
2. Zustand for global state (simpler than Redux for this scale)
3. Component composition with clear boundaries (Panel > Widget > Control)
4. Audio buffer preloading for instant sound effect playback
5. localStorage persistence layer separate from UI state

---

## Component Structure

### Component Hierarchy

```
App (Layout)
├── AudioProvider (Context - AudioContext singleton)
│   └── StoreProvider (Zustand store)
│       └── MainPanel
│           ├── Header
│           │   └── VolumeControls
│           │       ├── MusicVolumeSlider
│           │       └── EffectsVolumeSlider
│           │
│           ├── LeftColumn
│           │   ├── DicePanel
│           │   │   ├── DiceDisplay (x2)
│           │   │   └── RollButton
│           │   │
│           │   └── TimerPanel
│           │       ├── CountdownTimer
│           │       │   ├── TimeDisplay
│           │       │   ├── PresetButtons (30s, 1m, 5m, 10m)
│           │       │   ├── CustomInput
│           │       │   └── TimerControls (start/pause/reset)
│           │       │
│           │       └── Stopwatch
│           │           ├── TimeDisplay
│           │           └── StopwatchControls (start/stop/reset)
│           │
│           └── RightColumn
│               ├── MusicPanel
│               │   ├── TrackDropdown
│               │   ├── ProgressBar
│               │   ├── PlaybackControls (play/pause/stop)
│               │   └── LoopToggle
│               │
│               └── SoundEffectsPanel
│                   └── SoundButton (x10)
│                       ├── NameInput
│                       ├── AudioDropdown
│                       └── TriggerButton
```

### Component Boundaries

| Component | Responsibility | Talks To | Does NOT Handle |
|-----------|---------------|----------|-----------------|
| `AudioProvider` | AudioContext lifecycle, resume on user gesture | All audio components | UI rendering, state persistence |
| `VolumeControls` | Volume state UI | Store (volume values) | Audio node gain (delegated to hooks) |
| `DicePanel` | Dice rolling logic, animation state | Local state only | Sound (uses hook) |
| `CountdownTimer` | Timer logic, preset handling | Store (timer state), AudioProvider (alert sound) | Visual styling |
| `Stopwatch` | Elapsed time tracking | Local state only | Persistence |
| `MusicPanel` | Background music playback state | Store (track selection, playback), AudioProvider | Sound effects |
| `SoundButton` | Individual effect config + trigger | Store (config), AudioProvider (playback) | Other buttons' state |

### Component Communication Rules

```
1. Parent → Child: Props (configuration, callbacks)
2. Child → Parent: Callback invocation only
3. Sibling → Sibling: Via shared store (Zustand)
4. Any → Audio: Via AudioContext from React Context
5. Any → Persistence: Via store middleware (auto-sync to localStorage)
```

---

## State Architecture

### State Domains

The app has four distinct state domains with different characteristics:

| Domain | Scope | Persistence | Management |
|--------|-------|-------------|------------|
| **Audio State** | Global | No | React Context + refs |
| **Timer State** | Component | No | Local useState + useRef |
| **Config State** | Global | Yes (localStorage) | Zustand + persist middleware |
| **UI State** | Component | No | Local useState |

### Zustand Store Structure

```typescript
interface AppStore {
  // Volume (persisted)
  musicVolume: number;        // 0-1
  effectsVolume: number;      // 0-1
  setMusicVolume: (v: number) => void;
  setEffectsVolume: (v: number) => void;

  // Music Player (not persisted)
  currentTrack: string | null;
  isPlaying: boolean;
  isLooping: boolean;
  playbackProgress: number;   // 0-1
  setCurrentTrack: (track: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setPlaybackProgress: (progress: number) => void;

  // Sound Button Config (persisted)
  soundButtons: SoundButtonConfig[];
  updateSoundButton: (index: number, config: Partial<SoundButtonConfig>) => void;

  // Available Audio Files (loaded at startup)
  backgroundTracks: string[];
  effectFiles: string[];
  setAudioFiles: (bg: string[], effects: string[]) => void;
}

interface SoundButtonConfig {
  id: number;
  name: string;
  audioFile: string | null;
}
```

### State Location Rationale

| State | Location | Why |
|-------|----------|-----|
| `AudioContext` | React Context | Singleton requirement, needs user gesture handling |
| `musicVolume`, `effectsVolume` | Zustand (persisted) | User preference, survives refresh |
| `soundButtons` config | Zustand (persisted) | User customization, survives refresh |
| `isPlaying`, `currentTrack` | Zustand (not persisted) | Shared across components, but starts fresh |
| Timer values | Local `useState` | Component-specific, no sharing needed |
| Dice results | Local `useState` | Component-specific, ephemeral |
| Audio buffer cache | `useRef` in hook | Performance, no re-renders needed |

### Persistence Strategy

```typescript
// Zustand persist middleware configuration
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'lofi-config',
    partialize: (state) => ({
      musicVolume: state.musicVolume,
      effectsVolume: state.effectsVolume,
      soundButtons: state.soundButtons,
    }),
  }
)
```

---

## Audio Architecture

### The AudioContext Singleton Pattern

**Why single AudioContext?**
- [MDN Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices): "Create one AudioContext and reuse it"
- Safari limits: Only 4 AudioContexts allowed simultaneously
- Browser autoplay policy requires user gesture to resume suspended context

**Implementation:**

```typescript
// contexts/AudioContext.tsx
const AudioContextContext = createContext<AudioContext | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Lazy initialization on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, []);

  return (
    <AudioContextContext.Provider value={audioContextRef.current}>
      {/* Overlay for first interaction if needed */}
      {!isReady && <AudioInitOverlay onClick={initAudio} />}
      {children}
    </AudioContextContext.Provider>
  );
}
```

### Audio Node Graph

```
                    ┌─────────────────┐
                    │  AudioContext   │
                    │   (singleton)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌───────────┐  ┌───────────┐  ┌───────────┐
      │  Music    │  │  Effects  │  │  Timer    │
      │  Source   │  │  Source   │  │  Alert    │
      │  (stream) │  │  (buffer) │  │  (buffer) │
      └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
            │              │              │
            ▼              ▼              ▼
      ┌───────────┐  ┌───────────┐  ┌───────────┐
      │  Music    │  │  Effects  │  │  (uses    │
      │  Gain     │  │  Gain     │  │  Effects  │
      │  Node     │  │  Node     │  │  Gain)    │
      └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Destination │
                    │ (speakers)  │
                    └─────────────┘
```

### Audio Loading Strategies

| Audio Type | Strategy | Rationale |
|------------|----------|-----------|
| Background Music | HTMLAudioElement | Long files, streaming, progress events |
| Sound Effects | AudioBuffer (preloaded) | Short files, instant playback, no latency |
| Timer Alert | AudioBuffer (preloaded) | Must play immediately at zero |

**Sound Effect Preloading Hook:**

```typescript
// hooks/useSoundEffect.ts
function useSoundEffect(audioFile: string | null) {
  const audioContext = useAudioContext();
  const bufferRef = useRef<AudioBuffer | null>(null);
  const effectsGain = useEffectsGain();

  // Preload on mount or file change
  useEffect(() => {
    if (!audioFile || !audioContext) return;

    fetch(`/sounds/effects/${audioFile}`)
      .then(res => res.arrayBuffer())
      .then(data => audioContext.decodeAudioData(data))
      .then(buffer => { bufferRef.current = buffer; })
      .catch(console.error);
  }, [audioFile, audioContext]);

  const play = useCallback(() => {
    if (!bufferRef.current || !audioContext) return;

    const source = audioContext.createBufferSource();
    source.buffer = bufferRef.current;
    source.connect(effectsGain);
    source.start(0);
  }, [audioContext, effectsGain]);

  return { play, isLoaded: !!bufferRef.current };
}
```

**Background Music Hook:**

```typescript
// hooks/useBackgroundMusic.ts
function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContext = useAudioContext();
  const musicGain = useMusicGain();
  const { musicVolume, isPlaying, currentTrack, isLooping } = useStore();

  useEffect(() => {
    if (!audioContext || !currentTrack) return;

    // Create audio element and connect to Web Audio
    const audio = new Audio(`/sounds/background/${currentTrack}`);
    audio.loop = isLooping;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(musicGain);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [currentTrack, audioContext]);

  // Volume sync
  useEffect(() => {
    if (musicGain) {
      musicGain.gain.value = musicVolume;
    }
  }, [musicVolume, musicGain]);

  // Playback control
  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying]);
}
```

---

## Data Flow

### User Action Flow Diagrams

**1. Sound Button Press:**
```
User clicks button
        │
        ▼
SoundButton.onClick()
        │
        ▼
useSoundEffect.play()
        │
        ├── Get buffer from ref (preloaded)
        │
        ▼
Create BufferSourceNode
        │
        ▼
Connect to effectsGainNode
        │
        ▼
source.start(0) → Audio plays
```

**2. Sound Button Config Change:**
```
User types name / selects audio
        │
        ▼
SoundButton.onConfigChange()
        │
        ▼
store.updateSoundButton(index, { name, audioFile })
        │
        ├── Zustand updates state
        │
        ├── persist middleware → localStorage.setItem()
        │
        └── useSoundEffect → preloads new buffer
```

**3. Timer Zero Alert:**
```
CountdownTimer reaches 0
        │
        ▼
Local state: timeRemaining === 0
        │
        ├── Set visual alert state (flash/pulse)
        │
        └── useTimerAlert.play()
                │
                ▼
        Same as sound effect flow
```

**4. Volume Change:**
```
User drags volume slider
        │
        ▼
VolumeSlider.onChange(value)
        │
        ▼
store.setMusicVolume(value) OR store.setEffectsVolume(value)
        │
        ├── Zustand updates state
        │
        ├── persist middleware → localStorage
        │
        └── useEffect in audio hook
                │
                ▼
        gainNode.gain.value = value
```

### Config Persistence Flow

```
App Load
    │
    ▼
Zustand persist middleware
    │
    ├── Read localStorage('lofi-config')
    │
    ▼
Hydrate store with:
    - musicVolume
    - effectsVolume
    - soundButtons[10]
    │
    ▼
Components render with persisted values
    │
    ▼
useSoundEffect hooks preload configured audio files
```

---

## Suggested Build Order

Based on dependencies between components, build in this order:

### Phase 1: Foundation (No dependencies)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 1.1 | Project setup (Next.js, Tailwind, fonts) | Everything depends on this |
| 1.2 | Design tokens / theme (colors, typography) | All components need styling |
| 1.3 | Base panel components (Panel, Well, Button) | Visual foundation |

**Deliverable:** Styled empty shell with industrial theme

### Phase 2: Audio Infrastructure (Foundation for all sound)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 2.1 | AudioContext provider | All audio depends on this |
| 2.2 | Zustand store (basic structure) | State management foundation |
| 2.3 | Volume controls + gain nodes | Required for any audio playback |

**Deliverable:** App with working volume sliders (no sound yet)

### Phase 3: Simple Audio (Proves audio system works)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 3.1 | `useSoundEffect` hook | Simplest audio, good test |
| 3.2 | Single SoundButton (hardcoded) | Validates effect playback |
| 3.3 | SoundEffectsPanel (10 buttons) | Expand to full feature |
| 3.4 | Sound button config (name, dropdown) | Add customization |
| 3.5 | localStorage persistence | Complete the feature |

**Deliverable:** Working configurable soundboard

### Phase 4: Background Music (More complex audio)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 4.1 | `useBackgroundMusic` hook | Different pattern (streaming) |
| 4.2 | Track dropdown | Select music |
| 4.3 | Play/pause/stop controls | Basic playback |
| 4.4 | Progress bar | Progress tracking |
| 4.5 | Loop toggle | Complete feature |

**Deliverable:** Full background music player

### Phase 5: Timers (Independent of audio, except alert)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 5.1 | Stopwatch | Simpler (counts up) |
| 5.2 | Countdown timer (presets) | More complex |
| 5.3 | Custom time input | Edge cases |
| 5.4 | Timer alert (visual + sound) | Connects to audio |

**Deliverable:** Complete timer system

### Phase 6: Dice (Completely independent)

| Order | Component | Rationale |
|-------|-----------|-----------|
| 6.1 | Single die display | Visual component |
| 6.2 | Roll animation | Polish |
| 6.3 | Dual dice with roll button | Complete feature |

**Deliverable:** Working dice roller

### Phase 7: Integration & Polish

| Order | Task | Rationale |
|-------|------|-----------|
| 7.1 | Responsive layout | Tablet optimization |
| 7.2 | Audio file scanning (build-time) | List available files |
| 7.3 | Error handling | Edge cases |
| 7.4 | Performance optimization | Bundle, preloading |

**Deliverable:** Production-ready app

---

## Build Order Dependency Graph

```
[1.1 Setup] ─────────────────────────────────────────┐
     │                                                │
     ▼                                                │
[1.2 Theme] ──────────────────────────────────────┐  │
     │                                             │  │
     ▼                                             │  │
[1.3 Panels] ─────────────────────────────────────┼──┤
     │                                             │  │
     ▼                                             │  │
[2.1 AudioContext] ───────────────────────────────┼──┤
     │                                             │  │
     ├───────────────┐                             │  │
     ▼               ▼                             │  │
[2.2 Store]    [2.3 Volume]                        │  │
     │               │                             │  │
     └───────┬───────┘                             │  │
             │                                     │  │
             ▼                                     │  │
[3.1 useSoundEffect] ─────────┐                   │  │
             │                 │                   │  │
             ▼                 │                   │  │
[3.2-3.5 SoundButtons] ◄──────┘                   │  │
                                                   │  │
[4.1-4.5 Music Player] ◄───────────────────────────┘  │
                                                      │
[5.1-5.4 Timers] ◄────────────────────────────────────┤
                                                      │
[6.1-6.3 Dice] ◄──────────────────────────────────────┘

[7.1-7.4 Polish] ◄── All above complete
```

---

## Anti-Patterns to Avoid

### 1. Multiple AudioContext Instances
**Bad:** Creating new AudioContext per component
**Good:** Single context via React Context provider

### 2. Playing Audio Without User Gesture
**Bad:** Auto-playing on component mount
**Good:** First interaction triggers context.resume()

### 3. Re-creating Audio Elements on Every Render
**Bad:** `new Audio()` inside render function
**Good:** Store in useRef, create once

### 4. Storing Audio Objects in React State
**Bad:** `const [audio, setAudio] = useState(new Audio())`
**Good:** `const audioRef = useRef(new Audio())`

### 5. Not Cleaning Up Audio Sources
**Bad:** Creating sources without stopping/disconnecting
**Good:** Return cleanup function from useEffect

### 6. Mixing Persistence Concerns with UI
**Bad:** localStorage.setItem() in component handlers
**Good:** Zustand persist middleware handles it automatically

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Zustand | Simpler than Redux, built-in persist middleware, good for this scale |
| Audio library | Native Web Audio API | Full control, no extra dependency for core features |
| Background music | HTMLAudioElement + Web Audio | Progress events, streaming, connects to gain nodes |
| Sound effects | AudioBuffer | Preloaded, instant playback, no latency |
| Timer implementation | useState + useRef + useEffect | Standard React patterns, no library needed |
| Persistence | Zustand persist → localStorage | Automatic sync, simple setup |

---

## Sources

### HIGH Confidence (Official Documentation)
- [MDN: AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
- [MDN: Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [MDN: AudioContext Constructor](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext)

### MEDIUM Confidence (Verified Community Patterns)
- [React and Web Audio](http://joesul.li/van/react-and-web-audio/)
- [Sharing Audio in React with useContext](https://campedersen.com/react-audio)
- [use-sound React Hook](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/)
- [Making a Soundboard with React](https://carton.pm/notes/react-soundboard-part-1/)
- [react-timer-hook](https://www.npmjs.com/package/react-timer-hook)

### LOW Confidence (Single Source, Unverified)
- None used for architectural decisions

---

*Architecture designed for maintainability, clear separation of concerns, and optimal audio performance on tablet devices.*
