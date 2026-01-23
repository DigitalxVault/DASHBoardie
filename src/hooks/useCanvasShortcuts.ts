'use client'

import { useEffect, useCallback } from 'react'
import { useBlockOperations } from './useBlockOperations'

interface UseCanvasShortcutsOptions {
  enabled?: boolean
}

/**
 * Hook for canvas keyboard shortcuts.
 * Handles delete, duplicate, nudge, select all, and deselect.
 */
export function useCanvasShortcuts({ enabled = true }: UseCanvasShortcutsOptions = {}) {
  const {
    hasSelection,
    deleteSelected,
    duplicateSelected,
    nudgeSelected,
    selectAll,
    deselectAll,
  } = useBlockOperations()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const isMod = event.metaKey || event.ctrlKey

      // Delete / Backspace - Delete selected blocks
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (hasSelection) {
          event.preventDefault()
          deleteSelected()
        }
        return
      }

      // Ctrl/Cmd + D - Duplicate selected blocks
      if (isMod && event.key === 'd') {
        if (hasSelection) {
          event.preventDefault()
          duplicateSelected()
        }
        return
      }

      // Ctrl/Cmd + A - Select all blocks
      if (isMod && event.key === 'a') {
        event.preventDefault()
        selectAll()
        return
      }

      // Escape - Deselect all
      if (event.key === 'Escape') {
        event.preventDefault()
        deselectAll()
        return
      }

      // Arrow keys - Nudge selected blocks
      if (hasSelection) {
        const isLargeNudge = event.shiftKey

        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault()
            nudgeSelected(0, -1, isLargeNudge)
            break
          case 'ArrowDown':
            event.preventDefault()
            nudgeSelected(0, 1, isLargeNudge)
            break
          case 'ArrowLeft':
            event.preventDefault()
            nudgeSelected(-1, 0, isLargeNudge)
            break
          case 'ArrowRight':
            event.preventDefault()
            nudgeSelected(1, 0, isLargeNudge)
            break
        }
      }
    },
    [
      hasSelection,
      deleteSelected,
      duplicateSelected,
      selectAll,
      deselectAll,
      nudgeSelected,
    ]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
