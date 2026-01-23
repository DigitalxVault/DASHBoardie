'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type GlassPanelVariant = 'frosted' | 'solid' | 'subtle';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: GlassPanelVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<GlassPanelVariant, string> = {
  frosted: [
    'bg-[rgba(255,255,255,0.65)]',
    'dark:bg-[rgba(30,30,50,0.75)]',
    'backdrop-blur-[20px]',
    'border border-[rgba(255,255,255,0.85)]',
    'dark:border-[rgba(255,255,255,0.12)]',
    'shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]',
    'dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
  ].join(' '),
  solid: [
    'bg-[rgba(255,255,255,0.85)]',
    'dark:bg-[rgba(40,40,65,0.85)]',
    'backdrop-blur-[10px]',
    'border border-[rgba(255,255,255,0.9)]',
    'dark:border-[rgba(255,255,255,0.15)]',
    'shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
    'dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
  ].join(' '),
  subtle: [
    'bg-[rgba(255,255,255,0.4)]',
    'dark:bg-[rgba(25,25,45,0.5)]',
    'backdrop-blur-[8px]',
    'border border-[rgba(255,255,255,0.5)]',
    'dark:border-[rgba(255,255,255,0.08)]',
    'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
    'dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
  ].join(' '),
};

const paddingStyles: Record<NonNullable<GlassPanelProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function GlassPanel({
  children,
  className,
  variant = 'frosted',
  padding = 'md',
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'rounded-[20px]',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Inner well component for nested containers
export function GlassWell({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.08)]',
        'rounded-[12px]',
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]',
        className
      )}
    >
      {children}
    </div>
  );
}
