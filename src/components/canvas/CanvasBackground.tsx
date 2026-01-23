'use client'

import { Background, BackgroundVariant } from '@xyflow/react'

interface CanvasBackgroundProps {
  showGrid?: boolean
  gridSize?: number
}

export function CanvasBackground({
  showGrid = true,
  gridSize = 20,
}: CanvasBackgroundProps) {
  if (!showGrid) return null

  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={gridSize}
      size={1.5}
      color="rgba(138, 138, 154, 0.3)"
      className="dark:opacity-50"
    />
  )
}
