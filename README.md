# LoFi Immersive Interface

> A beautiful, all-in-one audio and utility dashboard for tabletop gaming sessions.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

---

## Overview

The LoFi Immersive Interface is a web-based control panel designed for board game and tabletop RPG enthusiasts. It combines sound effects, background music, timers, and dice rolling into a single, gorgeous glassmorphic interface.

**Live Demo:** [Coming Soon]

![LoFi Interface](https://img.shields.io/badge/Status-MVP%20Complete-success)

---

## Features

- **Sound Effects Board** - 10 customizable buttons for instant audio feedback
- **Background Music Player** - Seamless ambient music with loop control
- **Dual Timer Panel** - Countdown timer + stopwatch with millisecond precision
- **Dice Roller** - 2d6 with roll history and smooth animations
- **Liquid Glass UI** - Beautiful frosted glass design with soft shadows
- **Fully Responsive** - Works on mobile, tablet, and desktop
- **Zero Setup** - No login, no installation required

---

## Quick Start

### Play Online

Visit the deployed site and tap "Begin" to enter the control panel.

### Local Development

```bash
# Clone the repository
git clone https://github.com/DigitalxVault/MAGES_Interface.git
cd MAGES_Interface

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── WelcomeScreen.tsx
│   ├── MainInterface.tsx
│   ├── SoundEffectsPanel.tsx
│   ├── BackgroundMusic.tsx
│   ├── TimerPanel.tsx
│   └── DicePanel.tsx
├── providers/          # React context providers
├── stores/             # Zustand state management
└── lib/                # Utility functions
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **Zustand** | State management |
| **use-sound** | Audio playback |

---

## Adding Custom Sounds

### Sound Effects

Place MP3 files in `/public/sounds/effects/` and configure them via the "Configure" button in the Sound Effects panel.

### Background Music

Place MP3 files in `/public/sounds/background/` - they'll automatically appear in the track selector.

---

## Design System

This project uses the **Liquid Glass UI** design system. See [docs/styleguide.md](./docs/styleguide.md) for complete specifications.

**Key Colors:**
- Background: `#EEEEF5`
- Accent Teal: `#38D9A9`
- Accent Cyan: `#3BC9DB`
- Text Primary: `#1A1A2E`

**Typography:** Montserrat

---

## Roadmap

### MVP (v1.0) - Complete
- [x] Sound effects panel
- [x] Background music player
- [x] Countdown timer + stopwatch
- [x] Dice roller (2d6)
- [x] Liquid Glass UI
- [x] Responsive design

### Upcoming

- [ ] Persistent settings (LocalStorage)
- [ ] Additional dice types (d4, d8, d10, d12, d20)
- [ ] Custom sound upload
- [ ] Dark mode theme
- [ ] PWA support
- [ ] Multiple named timers

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Credits

Built by [Mages Studio](https://github.com/DigitalxVault)

---

### Support

For issues and feature requests, please [open an issue](https://github.com/DigitalxVault/MAGES_Interface/issues).
