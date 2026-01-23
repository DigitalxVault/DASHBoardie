# Dash-Boardie - Product Requirements Document

## Overview

**Dash-Boardie** is a modular, customizable dashboard builder for tabletop gaming sessions. Users can drag and drop feature blocks onto an infinite canvas to create personalized gaming interfaces with timers, dice rollers, sound effects, and background music.

---

## Problem Statement

Tabletop gaming sessions require various digital tools (timers, dice, sound effects, music) but existing solutions are either:
- Fixed layouts that don't match every game's needs
- Separate apps requiring constant switching between tools
- Not visually appealing for immersive gaming experiences
- Overly complex with features most users don't need

---

## Solution

A beautiful, glassmorphic canvas-based interface where users can:
- Drag features from a sidebar onto an infinite canvas
- Arrange, resize, and rotate blocks freely
- Save their layout automatically to localStorage
- Switch between light and dark themes
- Create multiple instances of the same feature (e.g., multiple timers)

---

## Target Users

| User Type | Use Case |
|-----------|----------|
| **Tabletop RPG Game Masters** | Running D&D, Pathfinder, or other RPG sessions with immersive audio and timing |
| **Board Game Enthusiasts** | Adding digital enhancement to physical board games |
| **Escape Room Designers** | Creating custom control panels for escape room experiences |
| **Event Organizers** | Managing timed activities with sound cues |
| **Educators** | Gamified classroom activities with timers and random selection |

---

## Core Features

### 1. Infinite Canvas

| Feature | Description |
|---------|-------------|
| **Pan** | Drag on empty canvas space to pan in any direction |
| **Zoom** | 0.25x to 2x zoom via scroll wheel, pinch gesture, or buttons |
| **Grid** | Dot pattern background for visual alignment |
| **Snap** | 20px snap-to-grid for precise block placement |
| **Minimap** | Corner navigation showing viewport position |

### 2. Feature Blocks

Four initial block types, each wrapping existing functionality:

#### Timer Block
- Dual mode: Countdown + Stopwatch
- Preset buttons: 30s, 1m, 5m, 10m
- Custom time input
- Visual progress ring
- Alert sound at zero

#### Dice Block
- 2D6 (two six-sided dice) roller
- Animated roll effect
- Sum display
- Roll history (last 5 rolls)
- Roll sound effect

#### Sound Effects Block
- 10 configurable sound buttons
- Assign any MP3 from effects library
- Custom button labels
- Independent volume control
- Play/stop toggle

#### Background Music Block
- Track selection dropdown
- Play/Pause/Stop controls
- Progress bar with seek
- Loop toggle
- Independent volume control

#### Block Capabilities (All Types)
| Capability | Description |
|------------|-------------|
| **Drag** | Click and drag anywhere on block to reposition |
| **Resize** | Corner/edge handles for resizing with min constraints |
| **Rotate** | 90-degree increments via context menu |
| **Duplicate** | Create copy via Ctrl+D or context menu |
| **Delete** | Remove via Delete key or context menu |
| **Multi-select** | Shift+click for multiple selection |

### 3. Navigation Panel

| Feature | Description |
|---------|-------------|
| **Feature List** | All available block types with preview images |
| **Drag Source** | Drag items from nav to canvas to add |
| **Collapse** | Arrow toggle to hide nav (more canvas space) |
| **Preview** | Static screenshot of each feature |

### 4. Theme Support

| Feature | Description |
|---------|-------------|
| **Light Mode** | Default - soft lavender gradient background |
| **Dark Mode** | Dark slate background with adjusted glass opacity |
| **Toggle** | Sun/Moon icon button for switching |
| **Persistence** | Theme choice saved to localStorage |
| **Transition** | Smooth 300ms color transition |

### 5. Persistence

| Data | Storage |
|------|---------|
| **Block Layout** | Positions, sizes, rotations, types |
| **Viewport** | Pan position and zoom level |
| **Theme** | Light or dark preference |
| **Feature State** | Volume levels, button configs, dice history |
| **Nav State** | Collapsed or expanded |

All data persisted to localStorage. No account required.

### 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected block(s) |
| `Ctrl+D` / `Cmd+D` | Duplicate selected block(s) |
| `Arrow Keys` | Nudge selected block(s) 1px |
| `Shift+Arrow` | Nudge selected block(s) 20px (grid size) |
| `Ctrl+A` / `Cmd+A` | Select all blocks |
| `Escape` | Deselect all blocks |

### 7. Context Menu (Right-Click)

| Action | Description |
|--------|-------------|
| **Duplicate** | Create copy offset by 20px |
| **Delete** | Remove block from canvas |
| **Rotate CW** | Rotate 90° clockwise |
| **Rotate CCW** | Rotate 90° counter-clockwise |
| **Bring to Front** | Increase z-index to top |
| **Send to Back** | Decrease z-index to bottom |

---

## User Interface Design

### Visual Style: Liquid Glass

- **Background**: Soft gradient (light: lavender, dark: slate)
- **Panels**: Frosted glass effect with backdrop blur
- **Accent**: Cyan-to-teal gradient for primary actions
- **Typography**: Montserrat font family
- **Corners**: Large radius (20px panels, 12px inner elements)
- **Shadows**: Multi-layer soft shadows with subtle glow

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Theme Toggle]                              [Dash-Boardie] │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  Feature │           Infinite Canvas                    │
│   Nav    │     ┌─────────┐  ┌─────────┐                │
│          │     │  Timer  │  │  Dice   │                │
│  [Timer] │     │  Block  │  │  Block  │                │
│          │     └─────────┘  └─────────┘                │
│  [Dice]  │                                              │
│          │     ┌─────────┐  ┌─────────┐                │
│  [Sound] │     │ Sound   │  │  Music  │                │
│          │     │ Effects │  │  Block  │                │
│  [Music] │     └─────────┘  └─────────┘                │
│          │                                              │
│   [<]    │                             [Minimap] [+][-] │
└──────────┴──────────────────────────────────────────────┘
```

---

## Non-Goals (v1.0)

The following are explicitly out of scope for the initial release:

| Non-Goal | Reason |
|----------|--------|
| Cloud sync / user accounts | Adds complexity, requires backend |
| Custom feature creation | Complex editor needed |
| Real-time collaboration | Requires WebSocket server |
| Mobile phone optimization | Canvas interactions need larger screens |
| Import/export layouts | Can be added in v1.1 |
| Custom themes | Can be added in v1.1 |
| Additional block types | Can be added incrementally |

---

## Technical Requirements

### Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16 (static export) |
| **UI Library** | React 19 |
| **Language** | TypeScript |
| **Canvas** | React Flow (@xyflow/react) |
| **State** | Zustand with persist middleware |
| **Styling** | Tailwind CSS 4 |
| **Audio** | Howler.js (via use-sound) |
| **Deployment** | Vercel (static) |
| **Storage** | localStorage only |

### Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Performance Targets

| Metric | Target |
|--------|--------|
| **Canvas FPS** | 60fps during pan/zoom |
| **Block Drag** | < 16ms response time |
| **Initial Load** | < 3s on 3G |
| **Time to Interactive** | < 2s on WiFi |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | Full shortcut support |
| **Focus Indicators** | Visible focus rings on blocks |
| **Color Contrast** | WCAG AA in both themes |
| **Screen Reader** | ARIA labels on controls |

---

## Success Metrics

### Qualitative

- [ ] Canvas interactions feel smooth and responsive
- [ ] Theme switching is seamless
- [ ] Layout persists correctly across browser sessions
- [ ] All audio features work within blocks
- [ ] Intuitive drag-and-drop from nav to canvas

### Quantitative

| Metric | Target |
|--------|--------|
| **Build Size** | < 500KB initial JS |
| **Lighthouse Performance** | > 90 |
| **localStorage Usage** | < 100KB typical |
| **Block Limit** | Support 20+ blocks without lag |

---

## Future Considerations (v1.1+)

| Feature | Priority |
|---------|----------|
| Export/Import layouts as JSON | High |
| Additional dice types (D4, D8, D10, D12, D20) | High |
| Custom sound upload | Medium |
| Timer presets saving | Medium |
| Block grouping | Medium |
| Undo/Redo | Medium |
| Custom themes | Low |
| Collaborative mode | Low |

---

## Appendix: Block Size Specifications

| Block Type | Default Size | Minimum Size |
|------------|--------------|--------------|
| Timer | 400 x 450 | 300 x 350 |
| Dice | 350 x 500 | 280 x 400 |
| Sound Effects | 450 x 400 | 350 x 300 |
| Background Music | 400 x 450 | 320 x 380 |

---

## Appendix: Storage Schema

### App State (`dashboardie-storage`)
```typescript
{
  musicVolume: number,        // 0-1
  effectsVolume: number,      // 0-1
  soundEffectButtons: [...],  // 10 button configs
  diceRolls: [...],           // Last 5 rolls
  theme: 'light' | 'dark'
}
```

### Canvas State (`dashboardie-canvas`)
```typescript
{
  blocks: [{
    id: string,
    type: 'timer' | 'dice' | 'soundEffects' | 'backgroundMusic',
    position: { x: number, y: number },
    size: { width: number, height: number },
    rotation: 0 | 90 | 180 | 270,
    zIndex: number
  }],
  viewport: { x: number, y: number, zoom: number },
  selectedBlockIds: string[],
  isNavCollapsed: boolean,
  gridSize: number,
  showGrid: boolean
}
```
