# Product Requirements Document (PRD)

## LoFi Immersive Interface

**Version:** 1.0.0
**Last Updated:** January 2026
**Owner:** Mages Studio
**Status:** MVP Complete

---

## 1. Executive Summary

### 1.1 Product Vision
The LoFi Immersive Interface is a web-based, ambient audio and utility control panel designed for tabletop gaming sessions. It provides board game players and game masters with an intuitive, visually appealing dashboard for managing sound effects, background music, timers, and dice rolling – all in one place.

### 1.2 Target Audience
- **Primary:** Tabletop gamers, board game enthusiasts, TTRPG game masters
- **Secondary:** Streamers, content creators, anyone needing ambient utility tools
- **Tertiary:** Casual users seeking aesthetic ambient interfaces

### 1.3 Key Differentiators
- **Glassmorphic Aesthetic:** Unique "Liquid Glass" UI design language
- **All-in-One Solution:** Integrated audio, timing, and randomization tools
- **Web-Based:** No app download required; works on any modern browser
- **Ambient Focus:** Designed to enhance, not distract from, the gaming experience

---

## 2. Product Overview

### 2.1 Problem Statement
Tabletop gaming sessions require multiple utility tools that are typically scattered across different apps, websites, or physical devices:
- Background music players (Spotify, YouTube, etc.)
- Sound effect boards for immersion
- Timer/stopwatch apps for turn tracking
- Physical dice for randomization
- Multiple browser tabs = cluttered experience

### 2.2 Solution
A unified, visually cohesive web application that combines all essential gaming utilities into a single, beautiful interface that enhances the tabletop experience without adding complexity.

### 2.3 Value Proposition
| Feature | Benefit |
|---------|---------|
| Unified Dashboard | One tab instead of five |
| Ambient Design | Enhances gaming atmosphere |
| Audio Integration | Instant sound effects, seamless music |
| Responsive | Works on tablet, laptop, or phone |
| Zero Setup | No login, no install, just open and use |

---

## 3. Feature Requirements

### 3.1 Core Features (MVP - Completed)

#### 3.1.1 Welcome Screen
**Priority:** P0
**Status:** ✅ Complete

**Requirements:**
- [x] Full-screen welcome overlay on app load
- [x] Company branding (Mages Studio logo)
- [x] "Tap to Begin" call-to-action
- [x] Audio context unlock on user interaction
- [x] Smooth fade-out transition to main interface
- [x] Glassmorphic panel design with frosted backdrop

**Technical Details:**
- Uses AudioProvider's `unlock()` method to initialize Web Audio API
- CSS transitions for fade animations (300-400ms duration)
- Prevents audio autoplay blocking by requiring user interaction

#### 3.1.2 Sound Effects Panel
**Priority:** P0
**Status:** ✅ Complete

**Requirements:**
- [x] 10 customizable sound effect buttons
- [x] Grid layout (2 cols mobile, 5 cols desktop)
- [x] Per-button sound file assignment via config modal
- [x] Master volume control for effects
- [x] Visual feedback during playback (glow, pulse animation)
- [x] Silent fallback for unassigned buttons

**Sound Categories Supported:**
- Ambient effects (footsteps, door creaks, wind)
- Action sounds (combat, magic, explosions)
- UI sounds (confirm, cancel, alert)
- Custom user-uploadable sounds (future)

**Technical Details:**
- Uses `use-sound` hook with HTML5 Audio
- Volume range: 0-1 with 5% increments
- Base64 silent audio fallback for unassigned buttons

#### 3.1.3 Background Music Panel
**Priority:** P0
**Status:** ✅ Complete

**Requirements:**
- [x] Track selection dropdown
- [x] Play/Pause/Stop transport controls
- [x] Seekable progress bar
- [x] Loop toggle
- [x] Master volume control
- [x] Real-time progress display (current/total time)
- [x] "Now Playing" indicator

**Technical Details:**
- Supports MP3 format from `/public/sounds/background/`
- Auto-scanning of available tracks (expandable)
- Uses `use-sound` hook with loop option
- Progress updates every 100ms during playback

#### 3.1.4 Timer Panel
**Priority:** P0
**Status:** ✅ Complete

**Requirements:**
- [x] **Countdown Timer:**
  - Preset durations (30s, 1m, 5m, 10m)
  - Custom MM:SS input
  - Start/Pause/Reset controls
  - Millisecond precision display
  - Visual ring progress indicator
  - Low-time alert (< 5 seconds)
  - Alert sound on completion

- [x] **Stopwatch:**
  - Start/Pause/Reset controls
  - Millisecond precision display
  - Seconds progress bar animation
  - Running/Paused status indicator

**Technical Details:**
- 50ms update interval for smooth millisecond display
- SVG-based circular progress for countdown
- Color changes to coral at low time
- Alert sound: "Alien Same Zone.mp3"

#### 3.1.5 Dice Panel
**Priority:** P0
**Status:** ✅ Complete

**Requirements:**
- [x] Two 6-sided dice (2d6)
- [x] Tap-to-roll interaction
- [x] Rolling animation (shake + blur effect)
- [x] Sum display
- [x] Roll history (timestamped)
- [x] Clear history option
- [x] Authentic dice appearance (ivory colored)

**Visual Details:**
- Dice color: Ivory (#f5f0e6) with shadow depth
- Dot colors: Red (1, 4), Blue (2, 3, 5, 6) - traditional Chinese style
- Roll animation: 500ms shake with blur effect

**Technical Details:**
- Roll sound effect: "Roll Dice.mp3"
- History stored in Zustand state
- Timestamp format: HH:MM

### 3.2 UI/UX Requirements

#### 3.2.1 Design System: Liquid Glass UI

**Core Principles:**
- Glassmorphism with frosted glass effects
- Soft shadows and layered depth
- Cyan-to-teal gradient accents
- Comfortable spacing and typography

**Color Palette:**
| Token | Value | Usage |
|-------|-------|------|
| Background Base | #EEEEF5 | Page background |
| Glass BG | rgba(255,255,255,0.65) | Panel background |
| Text Primary | #1A1A2E | Headings, labels |
| Text Muted | #8A8A9A | Secondary text |
| Accent Teal | #38D9A9 | Primary actions, success |
| Accent Cyan | #3BC9DB | Secondary accents |
| Accent Coral | #FF6B6B | Alerts, danger |

**Typography:**
- Family: Montserrat
- Sizes: 12px (xs) to 30px (3xl)
- Weights: 300 (light) to 700 (bold)

**Components:**
- GlassPanel (frosted, solid, subtle variants)
- GlassButton (primary, secondary, danger)
- GlassWell (inset content areas)

#### 3.2.2 Responsive Design

**Breakpoints:**
- Mobile: < 768px (single column, touch-optimized)
- Tablet: 768px - 1024px (2-column grid)
- Desktop: > 1024px (full layout, larger touch targets)

**Touch Requirements:**
- Minimum touch target: 44px
- Tap to roll, tap to play
- Swipe gestures (future)

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19.2, Next.js 16.1 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4.1, custom CSS |
| State Management | Zustand 5.0 |
| Audio | use-sound 5.0, Howler.js |
| Build | Next.js (static export capable) |
| Deployment | Vercel |

### 4.2 Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Welcome/Main routing
│   └── globals.css      # Global styles & Tailwind
├── components/
│   ├── WelcomeScreen.tsx     # Entry screen
│   ├── MainInterface.tsx     # Main dashboard
│   ├── SoundEffectsPanel.tsx # Sound board
│   ├── BackgroundMusic.tsx   # Music player
│   ├── TimerPanel.tsx        # Countdown + Stopwatch
│   ├── DicePanel.tsx         # 2d6 roller
│   ├── ConfigModal.tsx       # Sound configuration
│   └── ui/
│       ├── GlassPanel.tsx
│       ├── GlassButton.tsx
│       ├── GlassWell.tsx
│       └── (other UI components)
├── providers/
│   └── AudioProvider.tsx     # Web Audio context
├── stores/
│   └── appStore.ts          # Zustand global state
└── lib/
    └── fonts.ts             # Montserrat font config
public/
└── sounds/
    ├── effects/             # Sound effect MP3s
    └── background/          # Background music MP3s
```

### 4.3 State Management

**Zustand Store (`appStore`):**
```typescript
interface AppState {
  // Sound Effects
  soundEffectButtons: SoundEffectButton[]
  effectsVolume: number
  setEffectsVolume: (v: number) => void
  updateButtonSound: (id: string, file: string) => void

  // Background Music
  musicPlayback: {
    currentTrack: string
    isPlaying: boolean
    progress: number
    duration: number
    loop: boolean
  }
  musicVolume: number
  setMusicPlaying: (playing: boolean) => void
  setCurrentTrack: (track: string) => void

  // Timers
  timer: {
    countdownTime: number
    initialTime: number
    isRunning: boolean
    stopwatchTime: number
  }

  // Dice
  diceRolls: DiceRoll[]
  addDiceRoll: (roll: DiceRoll) => void
  clearDiceHistory: () => void
}
```

### 4.4 Audio Architecture

**AudioProvider:**
- Manages singleton Web Audio context
- Provides `unlock()` method for browser autoplay policies
- Handles audio context state (suspended/running)

**Sound Loading:**
- HTML5 Audio with `use-sound` hook
- Lazy loading on demand
- Volume control per category (effects/music)

---

## 5. Non-Functional Requirements

### 5.1 Performance
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 2s |
| Time to Interactive | < 3s |
| Audio latency | < 100ms |
| Animation FPS | 60fps |

### 5.2 Accessibility
- WCAG 2.1 Level AA compliance
- Minimum contrast ratio: 4.5:1 for text
- Focus visible on all interactive elements
- Keyboard navigation support
- Touch targets ≥ 44px

### 5.3 Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### 5.4 Mobile Support
- iOS Safari 14+
- Chrome Mobile 90+
- Responsive layout for 375px - 2560px

---

## 6. Future Enhancements (Post-MVP)

### 6.1 Planned Features
- [ ] **Persistent Settings** - LocalStorage for user preferences
- [ ] **Custom Sound Upload** - User-provided audio files
- [ ] **Additional Dice Types** - d4, d8, d10, d12, d20, d100
- [ ] **Multiple Timers** - Named timers for different players
- [ ] **Sound Library** - Expanded built-in sound catalog
- [ ] **PWA Support** - Offline capability, installable app
- [ ] **Dark Mode** - Alternative theme for low-light sessions
- [ ] **Session Export** - Save/load game configurations

### 6.2 Stretch Goals
- [ ] Collaborative mode (shared state across devices)
- [ ] Built-in ambient noise generator
- [ ] Initiative tracker for TTRPGs
- [ ] Campaign notes integration
- [ ] Streaming mode (OBS-friendly layout)

---

## 7. Success Metrics

### 7.1 MVP Success Criteria
- [x] All core features functional
- [x] Responsive design working on mobile/tablet/desktop
- [x] Audio plays reliably across browsers
- [x] Zero console errors in production
- [x] Deployment successful on Vercel

### 7.2 Post-Launch Metrics (To Track)
- Daily Active Users (DAU)
- Average session duration
- Feature usage breakdown
- Browser/device distribution
- Error rate via monitoring

---

## 8. Dependencies & Risks

### 8.1 External Dependencies
- **Vercel** for hosting
- **GitHub** for version control
- **Audio files** hosted in public directory

### 8.2 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser autoplay policies | High | User interaction requirement (welcome screen) |
| Audio file size | Medium | Compressed MP3s, lazy loading |
| Mobile Safari limitations | Medium | Testing on iOS, fallback behaviors |
| Copyrighted audio | Low | User-provided sounds only |

---

## 9. Open Questions

1. **Sound Library Expansion:** Should we include a curated library of CC-licensed sounds?
2. **Monetization:** Is this a free tool, or will we introduce premium features?
3. **Multiplayer:** What's the demand for collaborative sessions?
4. **Analytics:** Do we want user tracking, or keep it privacy-first?

---

## 10. Appendix

### 10.1 Glossary
- **TTRPG:** Tabletop Role-Playing Game
- **GM/DM:** Game Master / Dungeon Master
- **MVP:** Minimum Viable Product
- **PWA:** Progressive Web App

### 10.2 Related Documents
- [Style Guide](./styleguide.md) - Complete design system specifications
- [GitHub Repository](https://github.com/DigitalxVault/MAGES_Interface) - Source code

### 10.3 Change Log
| Date | Version | Changes |
|------|---------|---------|
| 2026-01-22 | 1.0.0 | Initial PRD for MVP release |

---

*This PRD is a living document and will be updated as the product evolves.*
