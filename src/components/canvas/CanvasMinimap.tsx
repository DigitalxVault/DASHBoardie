'use client'

import { MiniMap } from '@xyflow/react'
import { cn } from '@/lib/utils'

interface CanvasMinimapProps {
  className?: string
}

export function CanvasMinimap({ className }: CanvasMinimapProps) {
  return (
    <MiniMap
      className={cn(
        '!absolute !bottom-4 !left-4',
        '!bg-[rgba(255,255,255,0.7)] dark:!bg-[rgba(30,30,50,0.8)]',
        '!backdrop-blur-[10px]',
        '!border !border-[rgba(255,255,255,0.85)] dark:!border-[rgba(255,255,255,0.12)]',
        '!rounded-xl',
        '!shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:!shadow-[0_4px_16px_rgba(0,0,0,0.3)]',
        className
      )}
      nodeColor={(node) => {
        switch (node.data?.type) {
          case 'timer':
            return '#3BC9DB'
          case 'dice':
            return '#B197FC'
          case 'soundEffects':
            return '#38D9A9'
          case 'backgroundMusic':
            return '#FF8A80'
          default:
            return '#8A8A9A'
        }
      }}
      maskColor="rgba(138, 138, 154, 0.1)"
      pannable
      zoomable
      style={{
        width: 150,
        height: 100,
      }}
    />
  )
}
