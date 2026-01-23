'use client'

import { useReactFlow } from '@xyflow/react'
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvasStore'
import { CANVAS_CONFIG } from '@/types/canvas'

interface CanvasControlsProps {
  className?: string
}

export function CanvasControls({ className }: CanvasControlsProps) {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow()
  const resetCanvas = useCanvasStore((state) => state.resetCanvas)
  const toggleGrid = useCanvasStore((state) => state.toggleGrid)
  const showGrid = useCanvasStore((state) => state.showGrid)

  const handleZoomIn = () => {
    const currentZoom = getZoom()
    if (currentZoom < CANVAS_CONFIG.maxZoom) {
      zoomIn({ duration: 200 })
    }
  }

  const handleZoomOut = () => {
    const currentZoom = getZoom()
    if (currentZoom > CANVAS_CONFIG.minZoom) {
      zoomOut({ duration: 200 })
    }
  }

  const handleFitView = () => {
    fitView({ duration: 300, padding: 0.1 })
  }

  const handleReset = () => {
    if (window.confirm('Reset canvas to default layout? This will remove all blocks and restore defaults.')) {
      resetCanvas()
      setTimeout(() => fitView({ duration: 300, padding: 0.1 }), 100)
    }
  }

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 z-10',
        'flex flex-col gap-2',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-1',
          'bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(30,30,50,0.8)]',
          'backdrop-blur-[10px]',
          'border border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.12)]',
          'rounded-xl p-1.5',
          'shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
        )}
      >
        <ControlButton
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </ControlButton>

        <ControlButton
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </ControlButton>

        <ControlButton
          onClick={handleFitView}
          title="Fit View"
          aria-label="Fit all blocks in view"
        >
          <Maximize className="w-4 h-4" />
        </ControlButton>

        <div className="w-full h-px bg-[rgba(138,138,154,0.2)] my-0.5" />

        <ControlButton
          onClick={toggleGrid}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
          aria-label={showGrid ? 'Hide grid' : 'Show grid'}
          active={showGrid}
        >
          <GridIcon className="w-4 h-4" />
        </ControlButton>

        <ControlButton
          onClick={handleReset}
          title="Reset Canvas"
          aria-label="Reset canvas to default"
          variant="danger"
        >
          <RotateCcw className="w-4 h-4" />
        </ControlButton>
      </div>
    </div>
  )
}

interface ControlButtonProps {
  children: React.ReactNode
  onClick: () => void
  title: string
  'aria-label': string
  active?: boolean
  variant?: 'default' | 'danger'
}

function ControlButton({
  children,
  onClick,
  title,
  'aria-label': ariaLabel,
  active = false,
  variant = 'default',
}: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg',
        'transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#3BC9DB] focus:ring-offset-1',
        variant === 'default' && [
          'text-[#4A4A5A] dark:text-[#B5B5C5]',
          'hover:bg-[rgba(59,201,219,0.15)] hover:text-[#3BC9DB]',
          active && 'bg-[rgba(59,201,219,0.2)] text-[#3BC9DB]',
        ],
        variant === 'danger' && [
          'text-[#4A4A5A] dark:text-[#B5B5C5]',
          'hover:bg-[rgba(255,107,107,0.15)] hover:text-[#FF6B6B]',
        ]
      )}
    >
      {children}
    </button>
  )
}

// Simple grid icon
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
    >
      <circle cx="4" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
