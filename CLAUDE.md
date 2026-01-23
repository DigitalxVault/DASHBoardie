# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dash-Boardie** is a modular, drag-and-drop dashboard builder for tabletop gaming sessions. Users can drag feature blocks onto an infinite canvas to create customized gaming interfaces with timers, dice rollers, sound effects, and background music.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Flow, Zustand, use-sound

## Commands

```bash
npm run dev          # Start dev server (runs predev to generate audio manifest)
npm run build        # Production build to /out (static export)
npm run preview      # Preview production build with npx serve
npm run lint         # ESLint
npm run deploy       # Deploy to Vercel production
```

## Architecture

### Canvas System
- **React Flow (@xyflow/react)** provides infinite canvas with zoom/pan
- **Snap-to-grid:** 20px grid with dot background
- **Minimap:** Corner navigation aid
- **Controls:** Zoom buttons, reset canvas

### Feature Blocks
Four block types wrap existing panel components:
- `TimerBlock` → wraps `TimerPanel.tsx`
- `DiceBlock` → wraps `DicePanel.tsx`
- `SoundEffectsBlock` → wraps `SoundEffectsPanel.tsx`
- `BackgroundMusicBlock` → wraps `BackgroundMusic.tsx`

**Block capabilities:** Drag, resize, rotate (90° increments), duplicate, delete

### State Management
Two Zustand stores with persist middleware:

**`appStore.ts`** (`dashboardie-storage`):
- Volumes, soundEffectButtons config, diceRolls history
- Theme preference (light/dark)

**`canvasStore.ts`** (`dashboardie-canvas`):
- Block instances (positions, sizes, rotations)
- Viewport (pan, zoom)
- Selection state
- Nav collapsed state

### Audio System
- **Single AudioContext** shared via `src/providers/AudioProvider.tsx`
- **Background music:** HTMLAudioElement for streaming
- **Sound effects:** AudioBuffer preloading via use-sound
- First user interaction triggers `context.resume()` (browser autoplay policy)

### Audio Files
```
public/sounds/
├── background/    # Background music tracks (.mp3)
└── effects/       # Sound effect files (.mp3)
```
Files auto-discovered at build time via `scripts/generate-audio-manifest.js`.

### Component Structure
```
src/components/
├── canvas/           # DashboardCanvas, Controls, Minimap, Background
├── blocks/           # BlockWrapper, TimerBlock, DiceBlock, etc.
├── nav/              # FeatureNav, FeatureNavItem, FeaturePreview
├── ui/               # GlassPanel, GlassButton, ThemeToggle, ContextMenu
├── DashboardBuilder.tsx  # Main orchestrator
├── TimerPanel.tsx        # Timer feature (DO NOT MODIFY)
├── DicePanel.tsx         # Dice roller (DO NOT MODIFY)
├── SoundEffectsPanel.tsx # Soundboard (DO NOT MODIFY)
└── BackgroundMusic.tsx   # Music player (DO NOT MODIFY)
```

**Important:** The four panel components (Timer, Dice, SoundEffects, BackgroundMusic) are wrapped by blocks but should NOT be modified directly. They are working features.

## Design System: Liquid Glass UI

Reference: `docs/styleguide.md`

**Light Mode:**
- Background: `#F5F5FA → #EEEEF5`
- Glass: `rgba(255,255,255,0.65)` + `backdrop-blur(20px)`

**Dark Mode:**
- Background: `#1A1A2E`
- Glass: `rgba(30,30,40,0.75)` + `backdrop-blur(20px)`

**Accent:** `#3BC9DB (cyan) → #38D9A9 (teal)`
**Font:** Montserrat

## Key Constraints

- Static export only (`next.config.js: output: 'export'`) - no server-side logic
- No backend/database - localStorage only
- Audio files must exist at build time
- Tablet-optimized (mobile phone out of scope)
- Path alias: `@/*` → `src/*`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Delete | Delete selected block(s) |
| Ctrl+D | Duplicate selected block(s) |
| Arrow keys | Nudge 1px (20px with Shift) |
| Ctrl+A | Select all |
| Escape | Deselect all |
