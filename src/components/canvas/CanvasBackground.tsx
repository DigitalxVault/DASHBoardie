'use client'

import { Background, BackgroundVariant } from '@xyflow/react'
import { useAppStore } from '@/stores/appStore'

interface CanvasBackgroundProps {
  showGrid?: boolean
  gridSize?: number
}

export function CanvasBackground({
  showGrid = true,
  gridSize = 20,
}: CanvasBackgroundProps) {
  const theme = useAppStore((state) => state.theme)

  if (!showGrid) return null

  // Theme-aware dot colors for better visibility
  // Light mode: darker dots for contrast against light background
  // Dark mode: lighter dots for contrast against dark background
  const dotColor = theme === 'dark'
    ? 'rgba(200, 200, 220, 0.4)'
    : 'rgba(80, 80, 100, 0.25)'

  return (
    <Background
      variant={BackgroundVariant.Dots}
      gap={gridSize}
      size={1.5}
      color={dotColor}
    />
  )
}
