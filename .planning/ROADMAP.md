# Roadmap: RT Lofi Immersive Interface

## Overview

This roadmap delivers a tablet-responsive board game control panel in 6 phases, following a dependency-driven order. Audio infrastructure comes first (browser requirement), followed by sound effects (validates audio system with simpler buffer playback), background music (more complex streaming), timers (largely independent), dice (fully standalone), and final polish. Each phase delivers a complete, testable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffolding, theme system, audio context unlock
- [ ] **Phase 2: Sound Effects** - 10 configurable buttons with instant playback
- [ ] **Phase 3: Background Music** - Track player with transport controls and looping
- [ ] **Phase 4: Timers** - Countdown with presets and stopwatch
- [ ] **Phase 5: Dice Roller** - 2xD6 with animation and history
- [ ] **Phase 6: Polish** - Responsive refinement and deployment

## Phase Details

### Phase 1: Foundation
**Goal**: Establish project infrastructure with working audio context that unlocks on user gesture
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Plans**: 2 plans
**Success Criteria** (what must be TRUE):
  1. User sees welcome/start screen on first load
  2. Tapping the start button unlocks audio and reveals main interface
  3. Interface displays with industrial/steampunk metal aesthetic (dark panels, rivets, bevels)
  4. Touch targets are comfortably tappable on tablet (minimum 48dp)
  5. Layout adapts to both landscape and portrait orientations

Plans:
- [ ] 01-01-PLAN.md — Next.js 15 project setup with Tailwind CSS v4 theme system and base UI components
- [ ] 01-02-PLAN.md — Audio context provider, welcome screen, and main interface shell

### Phase 2: Sound Effects
**Goal**: Users can configure and play 10 instant sound effect buttons
**Depends on**: Phase 1
**Requirements**: EFFECTS-01, EFFECTS-02, EFFECTS-03, EFFECTS-04, EFFECTS-05, EFFECTS-06
**Plans**: TBD
**Success Criteria** (what must be TRUE):
  1. User sees 10 sound effect buttons in a grid layout
  2. Tapping a button plays its assigned sound instantly (no delay)
  3. User can edit button names and assign different audio files via dropdown
  4. Volume slider adjusts all sound effect playback levels
  5. Button configurations survive browser refresh (localStorage)

Plans:
- [ ] 02-01: Sound effects panel with button grid
- [ ] 02-02: Configuration UI and localStorage persistence

### Phase 3: Background Music
**Goal**: Users can play background music with full transport controls and seamless looping
**Depends on**: Phase 2
**Requirements**: BGMUSIC-01, BGMUSIC-02, BGMUSIC-03, BGMUSIC-04, BGMUSIC-05
**Plans**: TBD
**Success Criteria** (what must be TRUE):
  1. User can select a track from dropdown populated with available music files
  2. Play/pause/stop controls work as expected
  3. Progress bar shows current position and updates during playback
  4. Track loops back to start without audible gap when reaching end
  5. Volume slider adjusts background music independently of sound effects

Plans:
- [ ] 03-01: Background music player component
- [ ] 03-02: Progress tracking and seamless loop

### Phase 4: Timers
**Goal**: Users have countdown timer with presets and stopwatch for game timing needs
**Depends on**: Phase 1 (audio context for alerts)
**Requirements**: TIMER-01, TIMER-02, TIMER-03, TIMER-04, TIMER-05, TIMER-06, TIMER-07, WATCH-01, WATCH-02
**Plans**: TBD
**Success Criteria** (what must be TRUE):
  1. Countdown timer can be set via preset buttons (30s, 1m, 5m, 10m) or custom input
  2. Timer controls (start/pause/resume/reset) work correctly
  3. Timer digits are large and readable from across the table
  4. Visual progress indicator (bar or ring) shows time remaining
  5. Timer plays sound and flashes/pulses when reaching zero
  6. Stopwatch counts up from 00:00:00 with start/stop/reset controls

Plans:
- [ ] 04-01: Countdown timer with presets and custom input
- [ ] 04-02: Timer alerts and stopwatch

### Phase 5: Dice Roller
**Goal**: Users can roll 2xD6 dice with visual feedback and history
**Depends on**: Phase 1 (audio context for roll sound)
**Requirements**: DICE-01, DICE-02, DICE-03, DICE-04, DICE-05
**Plans**: TBD
**Success Criteria** (what must be TRUE):
  1. Tapping the roll area triggers a dice roll
  2. Both dice values and their sum are clearly displayed
  3. Roll animation provides satisfying visual feedback
  4. Last 5 rolls visible for dispute resolution
  5. Sound effect plays on each roll

Plans:
- [ ] 05-01: Dice roller component with animation and history

### Phase 6: Polish
**Goal**: Refine responsive behavior, animations, and deploy to production
**Depends on**: Phase 5
**Requirements**: (None - polish of existing requirements)
**Plans**: TBD
**Success Criteria** (what must be TRUE):
  1. All features work smoothly on tablet in both orientations
  2. Touch interactions feel responsive with appropriate visual feedback
  3. Application loads in under 3 seconds on typical connection
  4. Application is deployed and accessible via Vercel URL

Plans:
- [ ] 06-01: Responsive refinement and animation polish
- [ ] 06-02: Performance optimization and Vercel deployment

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planned | - |
| 2. Sound Effects | 0/2 | Not started | - |
| 3. Background Music | 0/2 | Not started | - |
| 4. Timers | 0/2 | Not started | - |
| 5. Dice Roller | 0/1 | Not started | - |
| 6. Polish | 0/2 | Not started | - |

---
*Roadmap created: 2025-01-21*
*Phase 1 planned: 2025-01-21*
*Total phases: 6 | Total requirements: 29 | Coverage: 100%*
