'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative w-14 h-8 rounded-full transition-all duration-300',
        'bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.1)]',
        'border border-[rgba(255,255,255,0.5)] dark:border-[rgba(255,255,255,0.15)]',
        'backdrop-blur-[8px]',
        'shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
        'hover:bg-[rgba(255,255,255,0.5)] dark:hover:bg-[rgba(255,255,255,0.15)]',
        'focus:outline-none focus:ring-2 focus:ring-[#3BC9DB] focus:ring-offset-2',
        'dark:focus:ring-offset-[#1a1a2e]',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sliding indicator */}
      <span
        className={cn(
          'absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ease-out',
          'bg-gradient-to-br from-[#3BC9DB] to-[#38D9A9]',
          'shadow-[0_2px_4px_rgba(0,0,0,0.1)]',
          theme === 'light' ? 'left-1' : 'left-7'
        )}
      />

      {/* Sun icon (light mode) */}
      <Sun
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300',
          theme === 'light'
            ? 'text-white opacity-100'
            : 'text-[#4A4A5A] dark:text-[#8A8A9A] opacity-50'
        )}
      />

      {/* Moon icon (dark mode) */}
      <Moon
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300',
          theme === 'dark'
            ? 'text-white opacity-100'
            : 'text-[#4A4A5A] dark:text-[#8A8A9A] opacity-50'
        )}
      />
    </button>
  )
}
