# Dash-Boardie

> A modular, drag-and-drop dashboard builder for tabletop gaming sessions.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12-purple)](https://reactflow.dev/)

---

## Overview

**Dash-Boardie** is a customizable control panel builder for board games and tabletop RPGs. Drag feature blocks onto an infinite canvas to create your perfect gaming interface with timers, dice rollers, sound effects, and background music.

**Features:**
- Infinite canvas with pan & zoom
- Drag-and-drop feature blocks
- Dark/Light theme toggle
- Glassmorphic UI design
- Auto-save to localStorage

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---

## Feature Blocks

| Block | Description |
|-------|-------------|
| **Timer** | Countdown + Stopwatch with presets and alert sounds |
| **Dice** | 2D6 roller with animated rolls and history |
| **Sound Effects** | 10 customizable buttons for instant audio |
| **Background Music** | Track player with loop and volume control |

### Block Capabilities
- Drag to reposition
- Resize via corner handles
- Rotate in 90° increments
- Duplicate (Ctrl+D)
- Multi-select (Shift+click)
- Right-click context menu

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dash-boardie.git
cd dash-boardie

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build static export
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Entry point
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Styles & theme variables
│
├── components/
│   ├── canvas/            # Canvas & controls
│   ├── blocks/            # Feature block wrappers
│   ├── nav/               # Navigation panel
│   ├── ui/                # Reusable components
│   ├── TimerPanel.tsx     # Timer feature
│   ├── DicePanel.tsx      # Dice roller
│   ├── SoundEffectsPanel.tsx
│   └── BackgroundMusic.tsx
│
├── stores/
│   ├── appStore.ts        # App preferences
│   └── canvasStore.ts     # Canvas layout
│
├── hooks/                 # Custom React hooks
├── providers/             # Context providers
└── types/                 # TypeScript definitions
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework (static export) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **React Flow** | Infinite canvas |
| **Tailwind CSS 4** | Styling |
| **Zustand** | State management |
| **use-sound** | Audio playback |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` | Delete selected block(s) |
| `Ctrl+D` / `Cmd+D` | Duplicate selected block(s) |
| `Arrow Keys` | Nudge 1px |
| `Shift+Arrow` | Nudge 20px (grid size) |
| `Ctrl+A` / `Cmd+A` | Select all blocks |
| `Escape` | Deselect all |

---

## Adding Audio

### Sound Effects
Place MP3 files in `/public/sounds/effects/` - configure via the Sound Effects panel.

### Background Music
Place MP3 files in `/public/sounds/background/` - they appear in the track selector automatically.

Audio files are auto-discovered at build time.

---

## Design System

**Liquid Glass UI** - Glassmorphic design with soft shadows and frosted panels.

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Background | `#EEEEF5` | `#1A1A2E` |
| Glass | `rgba(255,255,255,0.65)` | `rgba(30,30,40,0.75)` |
| Accent | `#38D9A9` → `#3BC9DB` | Same |
| Text | `#1A1A2E` | `#F5F5FA` |

**Typography:** Montserrat

See [docs/styleguide.md](./docs/styleguide.md) for full specifications.

---

## Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Static Hosting

```bash
npm run build
# Deploy contents of /out to any static host
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Credits

Built by [Mages Studio](https://github.com/DigitalxVault)

---

### Support

For issues and feature requests, please [open an issue](https://github.com/yourusername/dash-boardie/issues).
