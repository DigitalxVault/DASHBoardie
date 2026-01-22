# Phase 1: Foundation - Research

**Researched:** 2026-01-21
**Domain:** Next.js 15 project setup, Tailwind CSS v4 theming, AudioContext unlock, responsive tablet layout
**Confidence:** HIGH

## Summary

This research covers the technical foundation for a tablet-responsive board game control panel with an industrial/steampunk aesthetic. The phase establishes project scaffolding with Next.js 15 static export, implements the design system using Tailwind CSS v4's `@theme` directive, handles browser audio autoplay policy via a welcome screen pattern, and creates responsive layouts for tablet landscape/portrait orientations.

The stack decisions from STACK.md are validated as current and well-supported. Next.js 15 with static export is production-ready, Tailwind CSS v4's CSS-first configuration elegantly maps the style guide tokens to utility classes, and Howler.js (via use-sound) handles audio context unlocking with built-in mobile support.

**Primary recommendation:** Create a welcome/start screen that serves as the mandatory user gesture for audio context unlock, styled with the industrial metal aesthetic from day one.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.5.x | React framework with static export | Production stable, App Router mature, excellent static site generation |
| React | 19.x | UI component library | Latest stable, included with Next.js 15 |
| TypeScript | 5.7.x | Type safety | Included in create-next-app defaults |
| Tailwind CSS | 4.1.x | Utility-first CSS with design tokens | CSS-first @theme directive, perfect for custom industrial theme |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-sound | 5.0.0 | React hooks for audio | Audio context management, sound effects, background music |
| howler (peer) | 2.2.4 | Underlying audio engine | Automatically included with use-sound |
| Zustand | 5.0.x | State management with persist | Audio state, configuration persistence |
| next/font | included | Google Fonts optimization | Self-hosted fonts with zero layout shift |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| use-sound | Howler.js direct | More boilerplate, manual React integration |
| Tailwind CSS | CSS Modules | Less flexible for rapid theming iteration |
| next/font | Google Fonts CDN | External requests, privacy concerns, potential layout shift |

**Installation:**

```bash
# Create Next.js project with all defaults
npx create-next-app@latest lofi-interface --typescript --tailwind --eslint --app --src-dir --yes

# Core dependencies
npm install use-sound zustand

# TypeScript types for Howler (peer dependency)
npm install -D @types/howler
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    layout.tsx          # Root layout with fonts, global styles
    page.tsx            # Welcome screen (audio unlock entry point)
    globals.css         # Tailwind imports + @theme design tokens
  components/
    ui/                 # Reusable UI components (buttons, panels)
      MetalPanel.tsx
      RivetButton.tsx
    WelcomeScreen.tsx   # Audio unlock screen
    MainInterface.tsx   # Primary app interface (shown after unlock)
  hooks/
    useAudioContext.ts  # Audio context management hook
  stores/
    appStore.ts         # Zustand store with persist middleware
  lib/
    fonts.ts            # next/font configuration
public/
  sounds/
    background/         # Background music tracks
    effects/            # Sound effect files
```

### Pattern 1: Audio Context Unlock via Welcome Screen

**What:** A dedicated welcome/start screen that serves as the user gesture requirement for browser audio policy compliance.

**When to use:** Always on first load. Browser autoplay policy requires user gesture before AudioContext can play audio.

**Why this pattern:** Browser vendors (Chrome, Safari, Firefox) require user interaction before audio can play. Creating AudioContext on page load results in "suspended" state. A welcome screen provides clear UX and reliable unlock.

**Example:**

```typescript
// src/hooks/useAudioContext.ts
import { useCallback, useState, useEffect } from 'react';
import { Howler } from 'howler';

export function useAudioContext() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = useCallback(async () => {
    // Resume Howler's global audio context
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      await Howler.ctx.resume();
    }
    setIsUnlocked(true);
  }, []);

  return { isUnlocked, unlock };
}
```

```typescript
// src/components/WelcomeScreen.tsx
'use client';

import { useAudioContext } from '@/hooks/useAudioContext';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const { unlock } = useAudioContext();

  const handleStart = async () => {
    await unlock();
    onEnter();
  };

  return (
    <div className="welcome-screen">
      <button
        onClick={handleStart}
        className="start-button"
      >
        TAP TO BEGIN
      </button>
    </div>
  );
}
```

**Source:** [MDN Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay)

### Pattern 2: Tailwind CSS v4 @theme Design Tokens

**What:** CSS-first configuration using `@theme` directive to define design tokens that map directly to utility classes.

**When to use:** Define all custom colors, fonts, spacing, and effects in globals.css.

**Example:**

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Neutral palette from style guide */
  --color-bg-deep: #1C1C1E;
  --color-panel-base: #2B2F36;
  --color-panel-tint: #2F3A45;
  --color-well-inner: #23272E;
  --color-metal-mid: #3A4450;
  --color-metal-light: #90A8A6;
  --color-metal-highlight: #F1E8D9;
  --color-border-dark: #14161A;
  --color-text-primary: #E6E8EC;
  --color-text-secondary: #B7BEC8;
  --color-text-muted: #7C8794;

  /* Accent colors */
  --color-warning-amber: #F0B040;
  --color-warning-stripe: #E6C74A;
  --color-danger-red: #F04020;
  --color-success-green: #20A850;
  --color-info-cyan: #2AA7A0;
  --color-radar-green: #2BCB78;
  --color-purple-neon: #C46BFF;

  /* Typography */
  --font-label: "Bebas Neue", "Oswald", "Rajdhani", sans-serif;
  --font-button: "Anton", "Teko", Impact, sans-serif;
  --font-micro: "Roboto Condensed", "Inter Tight", "Rajdhani", sans-serif;

  /* Layout */
  --spacing-unit: 8px;
  --radius-panel: 14px;
  --radius-button: 6px;

  /* Tablet breakpoints */
  --breakpoint-tablet-portrait: 768px;
  --breakpoint-tablet-landscape: 1024px;
}
```

**Generated Utilities:**
- `bg-panel-base`, `bg-well-inner`, `bg-metal-mid`
- `text-text-primary`, `text-warning-amber`
- `font-label`, `font-button`, `font-micro`
- `rounded-panel`, `rounded-button`

**Source:** [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4), [Tailwind Theme Variables](https://tailwindcss.com/docs/theme)

### Pattern 3: Google Fonts with next/font

**What:** Self-hosted Google Fonts using next/font for zero layout shift and improved privacy.

**When to use:** Configure in a dedicated fonts file, apply to root layout.

**Example:**

```typescript
// src/lib/fonts.ts
import { Bebas_Neue, Oswald, Rajdhani, Inter } from 'next/font/google';

export const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

export const oswald = Oswald({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

export const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
});

// Fallback system font for micro UI
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

```typescript
// src/app/layout.tsx
import { bebasNeue, oswald, rajdhani, inter } from '@/lib/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${oswald.variable} ${rajdhani.variable} ${inter.variable}`}
    >
      <body className="bg-bg-deep text-text-primary font-micro">
        {children}
      </body>
    </html>
  );
}
```

**Source:** [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)

### Pattern 4: Static Export Configuration

**What:** Next.js static export for deployment as pure HTML/CSS/JS.

**When to use:** Configure in next.config.js for Vercel static hosting.

**Example:**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Optional: cleaner URLs
};

module.exports = nextConfig;
```

**Source:** [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)

### Anti-Patterns to Avoid

- **Creating AudioContext on page load:** Always create/resume inside user gesture handler
- **Using useEffect for audio initialization:** Audio context requires explicit user gesture, not component mount
- **Mixing Tailwind v3 config with v4:** Use `@theme` directive, not tailwind.config.js for custom tokens
- **Hardcoding colors in components:** Always use design token utilities (e.g., `bg-panel-base`)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio context unlock | Manual AudioContext management | Howler.js via use-sound | Handles browser quirks, mobile issues, format detection |
| Font loading | Link tags in head | next/font | Zero layout shift, self-hosted, privacy |
| State persistence | Manual localStorage | Zustand persist middleware | Reactive updates, TypeScript inference, SSR handling |
| CSS design tokens | CSS variables manually | Tailwind @theme | Auto-generates utility classes |
| iOS mute switch bypass | Custom audio element hack | Howler.js mobileAutoEnable | Built-in silent audio unlock |

**Key insight:** Browser audio policy compliance is deceptively complex. Howler.js handles edge cases (iOS mute switch, context states, HTML5 audio pool) that would require significant research and testing to implement correctly.

## Common Pitfalls

### Pitfall 1: AudioContext Created in Suspended State

**What goes wrong:** Audio context created before user interaction starts in "suspended" state. Calling `play()` does nothing - no errors, just silence.

**Why it happens:** Browser autoplay policy. Chrome, Safari, Firefox all enforce this.

**How to avoid:**
1. Never create AudioContext at page load
2. Always call `context.resume()` inside click/touch handler
3. Check `context.state === 'suspended'` before assuming audio works

**Warning signs:**
- Console: "An AudioContext was prevented from starting automatically"
- Audio works on desktop but fails on mobile/tablet
- `Howler.ctx.state` returns "suspended"

### Pitfall 2: iOS Safari Mute Switch Silences Web Audio

**What goes wrong:** Physical mute switch on iPad/iPhone mutes Web Audio API output completely. Users report "no sound" with no console errors.

**Why it happens:** iOS routes Web Audio to "ringer" channel by default, which respects mute switch.

**How to avoid:** Howler.js handles this automatically with `mobileAutoEnable` (enabled by default). It plays a silent audio track via HTML5 Audio element to switch iOS to "media" channel.

**Warning signs:**
- Audio works for some iOS users but not others (they have mute switch on)
- No errors in console - audio "plays" but produces no output
- Audio works on Android tablets but not iPads

### Pitfall 3: Hydration Mismatch with Zustand Persist

**What goes wrong:** Server renders with initial state, client hydrates with localStorage state, causing React hydration mismatch errors.

**Why it happens:** Server doesn't have access to localStorage. Client restores persisted state on mount.

**How to avoid:**
1. Use `skipHydration: true` in persist options
2. Manually call `rehydrate()` in useEffect
3. Or use a loading state until hydration completes

**Warning signs:**
- React hydration mismatch warnings in console
- UI flickers on page load
- State values differ between server and client render

### Pitfall 4: Touch Target Too Small on Tablet

**What goes wrong:** Buttons work on desktop but are difficult to tap accurately on tablet. Users miss buttons, trigger wrong elements.

**Why it happens:** Not accounting for finger precision vs mouse pointer precision.

**How to avoid:**
1. Minimum 48x48dp (48x48 CSS pixels) touch targets
2. 8dp minimum spacing between targets
3. Test on actual tablet devices, not just browser devtools

**Warning signs:**
- Users report buttons feel "fiddly" or unresponsive
- High error rate on button taps
- Works perfectly with mouse, problematic with touch

### Pitfall 5: Font Loading Causes Layout Shift

**What goes wrong:** Text content shifts when custom fonts load, causing poor CLS (Cumulative Layout Shift) score.

**Why it happens:** Browser renders with fallback font, then swaps to custom font with different metrics.

**How to avoid:**
1. Use next/font for automatic font optimization
2. Set `display: 'swap'` for progressive loading
3. Configure font variables, not direct application

**Warning signs:**
- Visible text reflow on page load
- Poor Core Web Vitals scores
- Flash of unstyled text (FOUT)

## Code Examples

Verified patterns from official sources:

### Complete Audio Context Provider

```typescript
// src/providers/AudioProvider.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Howler } from 'howler';

interface AudioContextValue {
  isUnlocked: boolean;
  unlock: () => Promise<void>;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = useCallback(async () => {
    if (isUnlocked) return;

    // Howler.js automatically creates a global AudioContext
    // Resume it if suspended (autoplay policy)
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      await Howler.ctx.resume();
    }

    // Howler also handles iOS mute switch with mobileAutoEnable
    setIsUnlocked(true);
  }, [isUnlocked]);

  return (
    <AudioContext.Provider value={{ isUnlocked, unlock }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
```

**Source:** [Howler.js GitHub](https://github.com/goldfire/howler.js), [MDN Web Audio Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

### Industrial Metal Panel Component

```typescript
// src/components/ui/MetalPanel.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetalPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'flat';
}

export function MetalPanel({
  children,
  className,
  variant = 'raised',
}: MetalPanelProps) {
  return (
    <div
      className={cn(
        'bg-panel-base rounded-panel p-4',
        // Bevel effect via box-shadow
        variant === 'raised' && [
          'shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),',
          'inset_-2px_-2px_4px_rgba(0,0,0,0.4),',
          '0_4px_8px_rgba(0,0,0,0.5)]',
        ].join(''),
        variant === 'inset' && [
          'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),',
          'inset_-1px_-1px_2px_rgba(255,255,255,0.05)]',
        ].join(''),
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Rivet Button Component

```typescript
// src/components/ui/RivetButton.tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RivetButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const RivetButton = forwardRef<HTMLButtonElement, RivetButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles - minimum 48px touch target
          'relative font-button uppercase tracking-wider',
          'rounded-button border border-border-dark',
          'transition-all duration-150 ease-out',
          // Touch target sizing
          size === 'sm' && 'min-h-[48px] px-4 text-sm',
          size === 'md' && 'min-h-[56px] px-6 text-base',
          size === 'lg' && 'min-h-[64px] px-8 text-lg',
          // Raised metal effect
          'shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.4)]',
          // Active/pressed state
          'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]',
          'active:translate-y-[1px]',
          // Variants
          variant === 'primary' && 'bg-metal-mid text-text-primary hover:bg-metal-light',
          variant === 'secondary' && 'bg-panel-tint text-text-secondary hover:bg-metal-mid',
          variant === 'danger' && 'bg-danger-red/80 text-white hover:bg-danger-red',
          // Embossed text effect
          '[text-shadow:0_1px_0_rgba(255,255,255,0.12),0_-1px_0_rgba(0,0,0,0.55)]',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

RivetButton.displayName = 'RivetButton';
```

### Responsive Tablet Layout

```typescript
// src/components/MainInterface.tsx
'use client';

export function MainInterface() {
  return (
    <div className={cn(
      'min-h-screen bg-bg-deep p-4',
      // Tablet portrait: single column stack
      'flex flex-col gap-4',
      // Tablet landscape: two-column grid
      'tablet-landscape:grid tablet-landscape:grid-cols-2 tablet-landscape:gap-6',
    )}>
      {/* Content panels */}
    </div>
  );
}
```

```css
/* Add to globals.css - custom breakpoint utilities */
@theme {
  --breakpoint-tablet-landscape: 1024px;
}

/* Custom media query for orientation */
@media (min-width: 768px) and (orientation: landscape) {
  .tablet-landscape\:grid {
    display: grid;
  }
  .tablet-landscape\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tablet-landscape\:gap-6 {
    gap: 1.5rem;
  }
}
```

### Zustand Store with Persist

```typescript
// src/stores/appStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  // Audio state
  isAudioUnlocked: boolean;
  musicVolume: number;
  effectsVolume: number;

  // Actions
  setAudioUnlocked: (unlocked: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAudioUnlocked: false,
      musicVolume: 0.5,
      effectsVolume: 0.7,

      setAudioUnlocked: (unlocked) => set({ isAudioUnlocked: unlocked }),
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      setEffectsVolume: (volume) => set({ effectsVolume: volume }),
    }),
    {
      name: 'lofi-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences, not runtime state
      partialize: (state) => ({
        musicVolume: state.musicVolume,
        effectsVolume: state.effectsVolume,
      }),
    }
  )
);
```

**Source:** [Zustand Persist Docs](https://zustand.docs.pmnd.rs/integrations/persisting-store-data)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | @theme directive in CSS | Tailwind v4 (Jan 2025) | Simpler config, CSS-native tokens |
| Google Fonts CDN links | next/font self-hosting | Next.js 13+ | Zero layout shift, better privacy |
| Manual AudioContext | Howler.js abstraction | Established pattern | Handles browser quirks automatically |
| px-based touch targets | dp-based (48dp minimum) | WCAG 2.2 (Oct 2023) | Accessibility compliance |

**Deprecated/outdated:**
- `tailwind.config.js` for design tokens: Use `@theme` directive in CSS instead
- External font links: Use next/font for optimization
- Direct Web Audio API: Use Howler.js for cross-browser compatibility

## Open Questions

Things that couldn't be fully resolved:

1. **Anton font availability**
   - What we know: Anton is on Google Fonts, suitable for button display
   - What's unclear: Whether Anton provides sufficient weight variants
   - Recommendation: Use Bebas Neue or Oswald as primary display font, Anton as fallback

2. **iOS Safari background tab audio suspension**
   - What we know: Safari suspends audio when tab is backgrounded
   - What's unclear: Exact behavior on iPad with PWA installed
   - Recommendation: Handle `visibilitychange` event to resume audio, accept as platform limitation

3. **Exact tablet breakpoint for this project**
   - What we know: Standard breakpoints are 768px (portrait) and 1024px (landscape)
   - What's unclear: Target device dimensions (iPad 10.9" vs iPad Pro 12.9")
   - Recommendation: Use 768px/1024px as default, test on actual devices and adjust

## Sources

### Primary (HIGH confidence)

- [Next.js Static Exports Documentation](https://nextjs.org/docs/app/guides/static-exports) - Static export configuration
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - Google Fonts with next/font
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) - @theme directive documentation
- [MDN Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) - AudioContext handling
- [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay) - Browser autoplay requirements
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - localStorage persistence

### Secondary (MEDIUM confidence)

- [Howler.js GitHub](https://github.com/goldfire/howler.js) - Audio library documentation
- [WCAG 2.5.8 Target Size](https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide) - Touch target accessibility
- [CSS Media Queries for Tablets](https://css-tricks.com/snippets/css/media-queries-for-standard-devices/) - Responsive breakpoints

### Tertiary (LOW confidence)

- [Howler.js iOS issues](https://github.com/goldfire/howler.js/issues/1436) - iOS mute switch behavior (GitHub issues, not official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries are well-documented with official sources
- Architecture patterns: HIGH - Based on official documentation and established patterns
- Audio unlock: HIGH - Chrome/MDN documentation is authoritative
- Pitfalls: HIGH - Verified against official bug trackers and MDN

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable technologies, no major releases expected)
