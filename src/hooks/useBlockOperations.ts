'use client'

import { useCallback } from 'react'
import { useCanvasStore } from '@/stores/canvasStore'

/**
 * Hook for common block operations, wrapping the canvas store actions
 * with convenience methods for use in components and shortcuts.
 */
export function useBlockOperations() {
  // Get store actions
  const selectedBlockIds = useCanvasStore((state) => state.selectedBlockIds)
  const blocks = useCanvasStore((state) => state.blocks)
  const removeBlock = useCanvasStore((state) => state.removeBlock)
  const removeBlocks = useCanvasStore((state) => state.removeBlocks)
  const duplicateBlock = useCanvasStore((state) => state.duplicateBlock)
  const duplicateBlocks = useCanvasStore((state) => state.duplicateBlocks)
  const rotateBlock = useCanvasStore((state) => state.rotateBlock)
  const bringToFront = useCanvasStore((state) => state.bringToFront)
  const sendToBack = useCanvasStore((state) => state.sendToBack)
  const selectAll = useCanvasStore((state) => state.selectAll)
  const deselectAll = useCanvasStore((state) => state.deselectAll)
  const updateBlockPosition = useCanvasStore((state) => state.updateBlockPosition)
  const gridSize = useCanvasStore((state) => state.gridSize)

  // Delete selected blocks
  const deleteSelected = useCallback(() => {
    if (selectedBlockIds.length === 0) return
    if (selectedBlockIds.length === 1) {
      removeBlock(selectedBlockIds[0])
    } else {
      removeBlocks(selectedBlockIds)
    }
  }, [selectedBlockIds, removeBlock, removeBlocks])

  // Duplicate selected blocks
  const duplicateSelected = useCallback(() => {
    if (selectedBlockIds.length === 0) return
    if (selectedBlockIds.length === 1) {
      duplicateBlock(selectedBlockIds[0])
    } else {
      duplicateBlocks(selectedBlockIds)
    }
  }, [selectedBlockIds, duplicateBlock, duplicateBlocks])

  // Rotate selected blocks
  const rotateSelected = useCallback(
    (direction: 'cw' | 'ccw') => {
      selectedBlockIds.forEach((id) => {
        rotateBlock(id, direction)
      })
    },
    [selectedBlockIds, rotateBlock]
  )

  // Bring selected blocks to front
  const bringSelectedToFront = useCallback(() => {
    selectedBlockIds.forEach((id) => {
      bringToFront(id)
    })
  }, [selectedBlockIds, bringToFront])

  // Send selected blocks to back
  const sendSelectedToBack = useCallback(() => {
    // Process in reverse to maintain relative order
    ;[...selectedBlockIds].reverse().forEach((id) => {
      sendToBack(id)
    })
  }, [selectedBlockIds, sendToBack])

  // Nudge selected blocks
  const nudgeSelected = useCallback(
    (dx: number, dy: number, large = false) => {
      const amount = large ? gridSize : 1
      selectedBlockIds.forEach((id) => {
        const block = blocks.find((b) => b.id === id)
        if (block) {
          updateBlockPosition(id, {
            x: block.position.x + dx * amount,
            y: block.position.y + dy * amount,
          })
        }
      })
    },
    [selectedBlockIds, blocks, updateBlockPosition, gridSize]
  )

  return {
    // State
    hasSelection: selectedBlockIds.length > 0,
    selectedCount: selectedBlockIds.length,
    selectedBlockIds,

    // Operations
    deleteSelected,
    duplicateSelected,
    rotateSelected,
    bringSelectedToFront,
    sendSelectedToBack,
    nudgeSelected,
    selectAll,
    deselectAll,
  }
}
