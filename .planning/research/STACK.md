# Stack Research: Audio Soundboard + Game Timer

**Project:** LoFi Immersive Interface
**Researched:** 2026-01-21
**Research Mode:** Stack Dimension (Ecosystem)

---

## Executive Summary

For a tablet-responsive board game control panel with audio playback, game timers, and an industrial/steampunk aesthetic, the recommended stack prioritizes:

1. **use-sound** (built on Howler.js) for React-native audio hooks
2. **Zustand** with persist middleware for state management and localStorage
3. **Tailwind CSS v4** with custom CSS variables for industrial theming
4. **Next.js 15** App Router with static export for Vercel deployment

This stack optimizes for developer experience, bundle size, and the specific requirements of a soundboard application.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Next.js | 15.5.x | React framework with static export | HIGH |
| React | 19.x | UI library | HIGH |
| TypeScript | 5.x | Type safety | HIGH |

**Rationale:** Next.js 15 provides React 19 support out of the box, excellent static site generation for Vercel deployment, and the `/public` folder convention for serving audio files. The App Router is mature and well-documented.

**Source:** [Next.js 15 Release](https://nextjs.org/blog/next-15), [Next.js Public Folder Docs](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder)

---

### Audio Playback

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| use-sound | 5.0.0 | React hooks for sound effects | HIGH |
| howler (peer) | 2.2.4 | Underlying audio engine | HIGH |
| @types/howler | 2.2.12 | TypeScript definitions | HIGH |

**Rationale:** `use-sound` provides the ideal abstraction for this project because:

1. **React-native API:** Hook-based interface (`const [play, { stop, pause }] = useSound(src)`) integrates naturally with React component lifecycle
2. **Built on Howler.js:** Gets the power of Howler (Web Audio API with HTML5 fallback, sprite support, format detection) without managing it directly
3. **Tiny footprint:** ~1KB gzipped, asynchronously loads ~10KB Howler
4. **Feature coverage:** Play/pause/stop, volume control, playback rate, loop support - exactly what's needed for background music and sound effects
5. **Escape hatch:** Access to underlying `Howl` instance for advanced features if needed

**For background music player specifically:**
```typescript
const [play, { stop, pause, sound }] = useSound('/sounds/music.mp3', {
  loop: true,
  volume: 0.5,
});

// Access Howl instance for progress tracking
sound?.seek(); // Get current position
sound?.duration(); // Get total duration
```

**Source:** [use-sound npm](https://www.npmjs.com/package/use-sound), [Josh W. Comeau's announcement](https://www.joshwcomeau.com/react/announcing-use-sound-react-hook/), [Howler.js](https://howlerjs.com/)

---

### State Management

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Zustand | 5.0.x | Global state management | HIGH |
| zustand/middleware (persist) | included | localStorage persistence | HIGH |

**Rationale:** Zustand is the clear winner for this use case:

1. **Perfect fit for audio state:** Interconnected state (playing status, current track, volume) with some frequently-updating state (progress position)
2. **Built-in persistence:** `persist` middleware handles localStorage with zero additional dependencies
3. **Minimal boilerplate:** ~1KB bundle, simpler than Redux, more structured than Context
4. **TypeScript-first:** Excellent type inference out of the box with v5

**Store structure for this project:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Music player
  musicVolume: number
  isMusicPlaying: boolean

  // Sound effects config (persisted)
  soundButtons: SoundButtonConfig[]

  // Timer state (not persisted)
  timerSeconds: number
  isTimerRunning: boolean
}

const useAppStore = create(
  persist(
    (set) => ({
      musicVolume: 0.5,
      soundButtons: defaultSoundButtons,
      // ... actions
    }),
    {
      name: 'lofi-storage',
      partialize: (state) => ({
        // Only persist config, not runtime state
        musicVolume: state.musicVolume,
        soundButtons: state.soundButtons,
      }),
    }
  )
)
```

**Why not Jotai:** While Jotai offers finer-grained reactivity (better for frequently-updating progress bars), the interconnected nature of audio player state (play/pause affects multiple UI elements simultaneously) and the need for persistence middleware makes Zustand's centralized approach cleaner. Zustand's selector pattern can optimize re-renders where needed.

**Why not React Context:** Context causes re-renders for all consumers on any state change. For audio state that changes frequently (progress updates), this would cause performance issues.

**Source:** [Zustand persist docs](https://zustand.docs.pmnd.rs/integrations/persisting-store-data), [State Management 2025 comparison](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)

---

### Styling

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Tailwind CSS | 4.1.x | Utility-first CSS | HIGH |
| CSS Custom Properties | native | Theme variables | HIGH |
| CSS box-shadow (inset) | native | Bevel/metal effects | HIGH |

**Rationale:** Tailwind CSS v4 with custom CSS variables is ideal for the industrial/steampunk aesthetic:

1. **CSS-first configuration:** v4's `@theme` directive allows defining design tokens directly in CSS - perfect for a custom dark metal theme
2. **No component library dependency:** Industrial/steampunk themes don't match any existing component library; custom CSS is required anyway
3. **Utility classes for rapid iteration:** Quickly adjust shadows, gradients, and borders
4. **Dark mode built-in:** `dark:` variant with class strategy

**Industrial Theme Implementation:**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Gunmetal/Industrial color palette */
  --color-metal-900: #1a1d21;
  --color-metal-800: #252a30;
  --color-metal-700: #353c44;
  --color-metal-600: #4a5460;
  --color-metal-500: #6b7785;

  /* Accent colors (copper/brass) */
  --color-copper: #b87333;
  --color-copper-glow: #d4956a;
  --color-brass: #c9a227;

  /* LED indicator colors */
  --color-led-red: #ff3b30;
  --color-led-green: #30d158;
  --color-led-amber: #ff9f0a;
}
```

**Bevel/Rivet Effects (CSS-in-Tailwind):**

```css
/* Metal panel with beveled edge */
.metal-panel {
  @apply bg-metal-800 rounded-lg;
  box-shadow:
    inset 2px 2px 4px rgba(255,255,255,0.05),
    inset -2px -2px 4px rgba(0,0,0,0.4),
    0 4px 8px rgba(0,0,0,0.5);
}

/* Rivet effect */
.rivet {
  @apply w-2 h-2 rounded-full bg-metal-600;
  box-shadow:
    inset 1px 1px 2px rgba(255,255,255,0.1),
    inset -1px -1px 2px rgba(0,0,0,0.3);
}

/* Pressed button state */
.btn-pressed {
  box-shadow:
    inset 3px 3px 6px rgba(0,0,0,0.4),
    inset -1px -1px 2px rgba(255,255,255,0.05);
}
```

**Why not CSS-in-JS (styled-components, Emotion):** Additional runtime overhead and bundle size. Tailwind's utility classes plus CSS custom properties achieve the same result with better performance and native browser support.

**Why not shadcn/ui or daisyUI:** These provide pre-styled components that don't match the industrial aesthetic. Would require overriding most styles anyway.

**Source:** [Tailwind CSS v4 release](https://tailwindcss.com/blog/tailwindcss-v4), [CSS box-shadow MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow)

---

### Framework Patterns

#### Static Audio File Serving

```
public/
  sounds/
    music/
      background-loop.mp3
    sfx/
      button-01.mp3
      button-02.mp3
      ... (10 configurable)
```

**Pattern:** Files in `/public/sounds/` are served at `/sounds/filename.mp3`. No webpack configuration needed.

**Important constraints:**
- Files must exist at build time (not runtime-added)
- Use absolute paths from root: `/sounds/sfx/button-01.mp3`
- Supported formats: MP3, WAV, OGG (Howler handles format detection)

**Source:** [Next.js Static Files](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder)

#### Static Export for Vercel

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static HTML export
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
```

**Rationale:** Full static export is optimal for this app:
- No server-side logic needed
- All audio files served as static assets
- localStorage handles persistence
- Faster deployment, lower cost

#### Audio Autoplay Policy Handling

Browsers require user interaction before audio can play. Pattern:

```typescript
// Handle audio context unlock on first user interaction
const [isUnlocked, setIsUnlocked] = useState(false)

const handleUserInteraction = useCallback(() => {
  if (!isUnlocked) {
    // Create and resume audio context
    Howler.ctx?.resume()
    setIsUnlocked(true)
  }
}, [isUnlocked])

// Attach to first click/touch anywhere
useEffect(() => {
  document.addEventListener('click', handleUserInteraction, { once: true })
  document.addEventListener('touchstart', handleUserInteraction, { once: true })
  return () => {
    document.removeEventListener('click', handleUserInteraction)
    document.removeEventListener('touchstart', handleUserInteraction)
  }
}, [handleUserInteraction])
```

**Source:** [Web Audio API Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

---

## Complete Installation

```bash
# Create Next.js project
npx create-next-app@latest lofi-interface --typescript --tailwind --eslint --app --src-dir

# Core dependencies
npm install use-sound zustand

# TypeScript types for Howler (peer dependency)
npm install -D @types/howler
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "use-sound": "^5.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/howler": "^2.2.12",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.1.0"
  }
}
```

---

## Alternatives Considered

### Audio Libraries

| Library | Why Not Chosen |
|---------|----------------|
| **Howler.js direct** | More boilerplate, requires manual React integration, no hooks API |
| **react-howler** | Lower adoption (6K weekly downloads vs 118K for use-sound), less maintained |
| **react-h5-audio-player** | Opinionated UI component, not suitable for custom industrial design |
| **Web Audio API direct** | Too low-level for simple playback needs, significant boilerplate |
| **HTML5 Audio element** | No programmatic control for sound effects, poor mobile support |

### State Management

| Library | Why Not Chosen |
|---------|----------------|
| **Jotai** | Atomic model better for independent state; audio state is interconnected |
| **Redux Toolkit** | Overkill for this scope, more boilerplate |
| **React Context** | Re-render performance issues with frequently-changing audio state |
| **Valtio** | Proxy-based approach adds complexity without benefit here |
| **localStorage direct** | No reactive updates, manual serialization, no TypeScript inference |

### Styling

| Approach | Why Not Chosen |
|----------|----------------|
| **shadcn/ui** | Pre-styled components don't match industrial aesthetic |
| **daisyUI** | Theme presets don't include industrial/steampunk |
| **styled-components** | Runtime overhead, bundle size increase |
| **CSS Modules** | Less flexible than Tailwind for rapid theming iteration |
| **Sass/SCSS** | Tailwind v4's CSS-first approach provides same features natively |

---

## Confidence Levels

| Area | Confidence | Rationale |
|------|------------|-----------|
| **use-sound** | HIGH | Well-established (118K weekly downloads), maintained by respected developer (Josh Comeau), built on proven Howler.js foundation |
| **Zustand** | HIGH | 14M+ weekly downloads, persist middleware is battle-tested, v5 is stable and widely adopted |
| **Tailwind v4** | HIGH | Stable release (Jan 2025), mature ecosystem, CSS-first config is production-ready |
| **Next.js 15** | HIGH | Production stable, static export well-documented, /public folder pattern established |
| **Industrial CSS approach** | MEDIUM | Requires custom implementation; no pre-built components. Well-documented CSS techniques but needs careful execution |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| **use-sound maintenance** | Maintainer states limited bandwidth for edge cases, but commits to React version compatibility. Escape hatch to Howler available if needed |
| **Howler.js age** | Last release 2 years ago (2.2.4), but stable and feature-complete for this use case. No breaking changes expected |
| **Tailwind v4 migration** | If starting fresh, no migration needed. v4 docs are complete |
| **Browser audio autoplay** | Well-understood pattern; unlock on first interaction |

---

## Sources

### Official Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Howler.js](https://howlerjs.com/)
- [use-sound GitHub](https://github.com/joshwcomeau/use-sound)

### Research References
- [npm trends: react-howler vs use-sound](https://npmtrends.com/react-howler-vs-use-sound)
- [State Management in 2025 - DEV Community](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [Web Audio API Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [CSS box-shadow - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-shadow)
