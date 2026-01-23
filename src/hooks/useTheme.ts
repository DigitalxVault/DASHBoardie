'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'

/**
 * Hook for managing theme state and applying theme class to document
 */
export function useTheme() {
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Also set color-scheme for native elements
    root.style.colorScheme = theme
  }, [theme])

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }
}
