# Module Development Guide

> A comprehensive guide for creating custom modules/blocks for the Dash-Boardie canvas system.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Design System Reference](#design-system-reference)
6. [State Management](#state-management)
7. [Audio Integration](#audio-integration)
8. [Best Practices](#best-practices)
9. [Complete Example: Notes Module](#complete-example-notes-module)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

Dash-Boardie uses a modular architecture where each feature is a **block** that can be dragged onto an infinite canvas. Users can position, resize, rotate, and organize these blocks to create custom gaming dashboards.

**What is a Module/Block?**

A module is a self-contained feature unit consisting of:
- **Type Definition** - TypeScript types and metadata
- **Panel Component** - The actual UI and logic
- **Block Wrapper** - A thin wrapper for canvas integration
- **State (optional)** - Persistent data using Zustand

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    src/types/canvas.ts                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BlockType Union  │  BLOCK_DEFAULTS  │  BLOCK_METADATA  │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              src/components/blocks/YourBlock.tsx            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Thin wrapper component                       │
│  │         <div className="w-full h-full">                 │
│  │           <YourPanel />                                 │
│  │         </div>                                          │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                src/components/YourPanel.tsx                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Your feature's full implementation            │
│  │         GlassPanel + Header + Content + Footer          │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   src/stores/appStore.ts                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Optional: Persistent state for your module       │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

| Layer | File Location | Purpose |
|-------|--------------|---------|
| **Type Layer** | `src/types/canvas.ts` | Block type, size constraints, metadata |
| **Block Layer** | `src/components/blocks/*.tsx` | Thin wrappers for canvas integration |
| **Panel Layer** | `src/components/*.tsx` | Full feature UI and logic |
| **State Layer** | `src/stores/appStore.ts` | Persistent data (optional) |

---

## Prerequisites

### Required Knowledge
- React 19 (hooks, functional components)
- TypeScript
- Tailwind CSS 4

### Key Dependencies
```json
{
  "@xyflow/react": "^12.x",     // Canvas system
  "zustand": "^5.x",            // State management
  "lucide-react": "^0.x",       // Icons
  "use-sound": "^4.x"           // Audio (optional)
}
```

### Development Setup
```bash
npm run dev    # Start dev server with hot reload
npm run lint   # Run ESLint checks
npm run build  # Build for production
```

---

## Step-by-Step Guide

### Step 1: Define Block Type

Edit `src/types/canvas.ts`:

```typescript
// 1. Add your type to the BlockType union
export type BlockType = 'timer' | 'dice' | 'soundEffects' | 'backgroundMusic' | 'yourModule'

// 2. Add size constraints
export const BLOCK_DEFAULTS: Record<BlockType, BlockSizeConstraints> = {
  // ... existing blocks ...
  yourModule: {
    default: { width: 400, height: 300 },  // Starting size
    min: { width: 280, height: 200 },      // Minimum resize limit
  },
}

// 3. Import your icon and add metadata
import { Timer, Dices, Volume2, Music, Sparkles, type LucideIcon } from 'lucide-react'

export const BLOCK_METADATA: Record<BlockType, BlockMetadata> = {
  // ... existing blocks ...
  yourModule: {
    name: 'Your Module',
    description: 'Brief description of functionality',
    icon: Sparkles,
    colorClass: 'text-[#FF6B6B] bg-[rgba(255,107,107,0.15)]',  // Accent color
    accentColor: '#FF6B6B',
  },
}
```

### Step 2: Create Panel Component

Create `src/components/YourPanel.tsx`:

```typescript
'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useState, useCallback } from 'react';

export function YourPanel() {
  const [data, setData] = useState('');

  const handleAction = useCallback(() => {
    // Your logic here
  }, []);

  return (
    <GlassPanel variant="frosted" className="h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-text-primary">
            Your Module
          </h2>
          <GlassButton size="sm" variant="secondary" onClick={handleAction}>
            Action
          </GlassButton>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Your feature UI goes here */}
        </div>

        {/* Footer (optional) */}
        <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
          {/* Controls, sliders, etc. */}
        </div>
      </div>
    </GlassPanel>
  );
}
```

### Step 3: Create Block Wrapper

Create `src/components/blocks/YourBlock.tsx`:

```typescript
'use client'

import { YourPanel } from '@/components/YourPanel'

export function YourBlock() {
  return (
    <div className="w-full h-full">
      <YourPanel />
    </div>
  )
}
```

### Step 4: Register in BlockNode

Edit `src/components/canvas/BlockNode.tsx`:

```typescript
// Add lazy import at the top with other blocks
const YourBlock = lazy(() =>
  import('@/components/blocks/YourBlock').then(m => ({ default: m.YourBlock }))
)

// Add case to BlockContent switch statement
function BlockContent({ type }: { type: BlockType }) {
  switch (type) {
    case 'timer':
      return <TimerBlock />
    case 'dice':
      return <DiceBlock />
    case 'soundEffects':
      return <SoundEffectsBlock />
    case 'backgroundMusic':
      return <BackgroundMusicBlock />
    case 'yourModule':           // Add this case
      return <YourBlock />
    default:
      return null
  }
}
```

### Step 5: Add to Navigation

Edit `src/components/nav/FeatureNav.tsx`:

```typescript
// Add your block type to the BLOCK_TYPES array
const BLOCK_TYPES: BlockType[] = [
  'timer',
  'dice',
  'soundEffects',
  'backgroundMusic',
  'yourModule'  // Add here
]
```

### Step 6: (Optional) Add Persistent State

If your module needs to persist data, edit `src/stores/appStore.ts`:

```typescript
// 1. Define your state interface
interface YourModuleState {
  items: string[];
  setting: boolean;
}

// 2. Add to AppState interface
interface AppState {
  // ... existing state ...
  yourModule: YourModuleState;

  // Actions
  setYourModuleItems: (items: string[]) => void;
  toggleYourModuleSetting: () => void;
}

// 3. Add default state
const defaultYourModule: YourModuleState = {
  items: [],
  setting: false,
};

// 4. Add to create() implementation
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ... existing state ...
      yourModule: defaultYourModule,

      setYourModuleItems: (items) =>
        set((state) => ({
          yourModule: { ...state.yourModule, items },
        })),

      toggleYourModuleSetting: () =>
        set((state) => ({
          yourModule: { ...state.yourModule, setting: !state.yourModule.setting },
        })),
    }),
    {
      // ... existing config ...
      partialize: (state) => ({
        // ... existing persisted fields ...
        yourModule: state.yourModule,  // Add to persist
      }),
    }
  )
)
```

---

## Design System Reference

### UI Components

#### GlassPanel

The main container component for all modules:

```typescript
import { GlassPanel, GlassWell } from '@/components/ui/GlassPanel';

<GlassPanel
  variant="frosted"  // 'frosted' | 'solid' | 'subtle'
  padding="md"       // 'none' | 'sm' | 'md' | 'lg'
  className="h-full"
>
  {children}
</GlassPanel>

// For nested containers
<GlassWell className="p-4">
  {content}
</GlassWell>
```

**Variants:**
| Variant | Use Case |
|---------|----------|
| `frosted` | Main panels (default) |
| `solid` | Higher contrast content |
| `subtle` | Background elements |

#### GlassButton

```typescript
import { GlassButton } from '@/components/ui/GlassButton';

<GlassButton
  size="sm"          // 'sm' | 'md' | 'lg'
  variant="primary"  // 'primary' | 'secondary' | 'danger'
  onClick={handler}
  disabled={false}
>
  Button Text
</GlassButton>
```

### Color Palette

| Color | Hex | CSS Variable | Use Case |
|-------|-----|--------------|----------|
| Cyan | `#3BC9DB` | `accent-cyan` | Primary actions |
| Teal | `#38D9A9` | `accent-teal` | Success, highlights |
| Purple | `#B197FC` | `accent-purple` | Secondary features |
| Coral | `#FF8A80` | `accent-coral` | Warnings, audio |

### Typography Classes

```css
/* Headings */
.text-lg.font-semibold.text-text-primary    /* Panel titles */
.text-sm.font-semibold.text-text-secondary  /* Section labels */

/* Body */
.text-sm.text-text-primary                  /* Main content */
.text-xs.text-text-muted                    /* Hints, timestamps */
```

### Dark Mode

Always provide dark mode variants using `dark:` prefix:

```typescript
className="
  bg-[rgba(255,255,255,0.6)]
  dark:bg-[rgba(40,40,60,0.6)]
  text-text-primary
  dark:text-[#F5F5FA]
"
```

---

## State Management

### When to Use Each Store

| Store | Storage Key | Use Case |
|-------|-------------|----------|
| `appStore` | `dashboardie-storage` | User preferences, feature data |
| `canvasStore` | `dashboardie-canvas` | Block positions, sizes (read-only for modules) |

### Usage Pattern

```typescript
import { useAppStore } from '@/stores/appStore';

function YourPanel() {
  // Subscribe to specific state
  const { items, setting } = useAppStore((state) => state.yourModule);
  const setItems = useAppStore((state) => state.setYourModuleItems);

  // Use in handlers
  const handleAdd = (item: string) => {
    setItems([...items, item]);
  };

  return (/* ... */);
}
```

### Persisted vs Runtime State

```typescript
// In appStore persist config
partialize: (state) => ({
  // These ARE saved to localStorage:
  musicVolume: state.musicVolume,
  soundEffectButtons: state.soundEffectButtons,

  // These are NOT saved (runtime only):
  // musicPlayback, timer - they reset on page load
}),
```

---

## Audio Integration

### Sound Effects (use-sound)

For short audio clips that preload:

```typescript
import { useSound } from 'use-sound';

function YourPanel() {
  const [playSound] = useSound('/sounds/effects/click.mp3', {
    volume: 0.7,
    html5: true,
  });

  return (
    <button onClick={() => playSound()}>
      Play Sound
    </button>
  );
}
```

### Background Audio (HTMLAudioElement)

For longer tracks with streaming:

```typescript
import { useRef, useEffect } from 'react';

function YourPanel() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/background/track.mp3');
    audioRef.current.loop = true;

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const play = () => audioRef.current?.play();
  const pause = () => audioRef.current?.pause();

  return (/* ... */);
}
```

### Audio Manifest

Audio files in `public/sounds/effects/` and `public/sounds/background/` are auto-discovered at build time:

```typescript
import { audioManifest } from '@/generated/audio-manifest';

// Available files:
audioManifest.effects     // string[] - effect filenames
audioManifest.background  // string[] - background music filenames
```

---

## Best Practices

### 1. Responsive Design

Use Tailwind's responsive prefixes for tablet optimization:

```typescript
className="text-sm sm:text-base"        // Font scaling
className="gap-2 sm:gap-4"              // Spacing
className="grid-cols-2 sm:grid-cols-4"  // Grid columns
```

### 2. Overflow Handling

Prevent content overflow in resizable blocks:

```typescript
className="flex-1 overflow-hidden"      // Clip overflowing content
className="min-w-0"                     // Allow flex items to shrink
className="overflow-y-auto max-h-[200px]" // Scrollable lists
```

### 3. Performance

```typescript
// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Use refs for intervals/timers (not state)
const intervalRef = useRef<NodeJS.Timeout | null>(null);

// Clean up effects
useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, []);
```

### 4. Accessibility

```typescript
// Disabled states
className="disabled:opacity-50 disabled:cursor-not-allowed"

// Focus states
className="focus:outline-none focus:ring-2 focus:ring-accent-teal"

// Semantic HTML
<button> for actions, <a> for navigation
```

### 5. Modals and Portals

If your module has modals, render them as portals to avoid transform issues:

```typescript
import { createPortal } from 'react-dom';

function YourModal({ isOpen, children }) {
  if (!isOpen) return null;

  if (typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed inset-0 z-50 ...">{children}</div>,
      document.body
    );
  }
  return null;
}
```

---

## Complete Example: Notes Module

Let's create a simple "Notes" module that allows users to write quick notes.

### Step 1: Update `src/types/canvas.ts`

```typescript
// 1. Add to BlockType union
export type BlockType = 'timer' | 'dice' | 'soundEffects' | 'backgroundMusic' | 'notes'

// 2. Add size constraints
export const BLOCK_DEFAULTS: Record<BlockType, BlockSizeConstraints> = {
  // ... existing ...
  notes: {
    default: { width: 350, height: 400 },
    min: { width: 250, height: 300 },
  },
}

// 3. Import icon and add metadata
import { Timer, Dices, Volume2, Music, StickyNote, type LucideIcon } from 'lucide-react'

export const BLOCK_METADATA: Record<BlockType, BlockMetadata> = {
  // ... existing ...
  notes: {
    name: 'Quick Notes',
    description: 'Jot down session notes',
    icon: StickyNote,
    colorClass: 'text-[#FFD43B] bg-[rgba(255,212,59,0.15)]',
    accentColor: '#FFD43B',
  },
}
```

### Step 2: Create `src/components/NotesPanel.tsx`

```typescript
'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlassButton } from '@/components/ui/GlassButton';
import { useAppStore } from '@/stores/appStore';
import { useCallback } from 'react';

export function NotesPanel() {
  const { notesContent, setNotesContent, clearNotes } = useAppStore();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesContent(e.target.value);
  }, [setNotesContent]);

  const handleClear = useCallback(() => {
    if (confirm('Clear all notes?')) {
      clearNotes();
    }
  }, [clearNotes]);

  return (
    <GlassPanel variant="frosted" className="h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-text-primary">
            Quick Notes
          </h2>
          {notesContent && (
            <GlassButton size="sm" variant="danger" onClick={handleClear}>
              Clear
            </GlassButton>
          )}
        </div>

        {/* Textarea */}
        <textarea
          value={notesContent}
          onChange={handleChange}
          placeholder="Type your notes here..."
          className="
            flex-1 w-full resize-none
            bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(40,40,60,0.5)]
            border border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.15)]
            rounded-xl p-3
            text-text-primary text-sm font-medium
            placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-[#FFD43B]/50
          "
        />

        {/* Footer */}
        <div className="pt-3 text-xs text-text-muted text-right">
          Auto-saved
        </div>
      </div>
    </GlassPanel>
  );
}
```

### Step 3: Create `src/components/blocks/NotesBlock.tsx`

```typescript
'use client'

import { NotesPanel } from '@/components/NotesPanel'

export function NotesBlock() {
  return (
    <div className="w-full h-full">
      <NotesPanel />
    </div>
  )
}
```

### Step 4: Update `src/components/canvas/BlockNode.tsx`

```typescript
// Add lazy import
const NotesBlock = lazy(() =>
  import('@/components/blocks/NotesBlock').then(m => ({ default: m.NotesBlock }))
)

// Add to switch statement
case 'notes':
  return <NotesBlock />
```

### Step 5: Update `src/components/nav/FeatureNav.tsx`

```typescript
const BLOCK_TYPES: BlockType[] = [
  'timer',
  'dice',
  'soundEffects',
  'backgroundMusic',
  'notes'  // Add here
]
```

### Step 6: Update `src/stores/appStore.ts`

```typescript
interface AppState {
  // ... existing ...
  notesContent: string;
  setNotesContent: (content: string) => void;
  clearNotes: () => void;
}

// In create():
notesContent: '',

setNotesContent: (content) => set({ notesContent: content }),

clearNotes: () => set({ notesContent: '' }),

// In partialize:
partialize: (state) => ({
  // ... existing ...
  notesContent: state.notesContent,
}),
```

---

## Troubleshooting

### Module Not Appearing in Navigation

1. Check `BLOCK_TYPES` array in `src/components/nav/FeatureNav.tsx`
2. Verify `BLOCK_METADATA` has an entry in `src/types/canvas.ts`
3. Ensure icon is imported from `lucide-react`

### Sizing Issues

1. Check `BLOCK_DEFAULTS` has both `default` and `min` sizes
2. Ensure panel uses `h-full` class for full height
3. Verify flex container structure: `flex flex-col h-full`

### State Not Persisting

1. Add field to `partialize` config in appStore
2. Check storage key conflict (`dashboardie-storage`)
3. Verify no SSR issues with `typeof window !== 'undefined'`

### Content Overflowing Block

1. Add `overflow-hidden` to containers
2. Use `min-w-0` on flex children
3. Check `flex-1` is used for variable-height sections

### Modal Appears Behind or Scaled Incorrectly

1. Use `createPortal` to render to `document.body`
2. Add `z-50` or higher for proper stacking
3. Wrap portal check: `typeof document !== 'undefined'`

### Fonts Too Small When Block is Resized

The canvas uses CSS `transform: scale()` to proportionally scale content. Your fonts will automatically scale with the block. Design for the **default size** and the system handles scaling.

---

## File Reference

| File | Purpose |
|------|---------|
| `src/types/canvas.ts` | Block types, sizes, metadata |
| `src/components/canvas/BlockNode.tsx` | Block rendering, lazy loading |
| `src/components/blocks/*.tsx` | Block wrapper components |
| `src/components/nav/FeatureNav.tsx` | Navigation registration |
| `src/stores/canvasStore.ts` | Canvas state (positions, zoom) |
| `src/stores/appStore.ts` | Feature state patterns |
| `src/components/ui/GlassPanel.tsx` | Panel UI component |
| `src/components/ui/GlassButton.tsx` | Button UI component |

---

## Questions or Issues?

For additional help, refer to:
- [docs/styleguide.md](./styleguide.md) - Full design system specifications
- [README.md](../README.md) - Project overview and setup

---

*Last updated: January 2026*
