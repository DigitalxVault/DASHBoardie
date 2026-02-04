'use client'

import { memo, useCallback, lazy, Suspense } from 'react'
import type { NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvasStore'
import type { BlockType } from '@/types/canvas'
import { X } from 'lucide-react'

// Lazy load block components to avoid circular dependencies
const TimerBlock = lazy(() => import('@/components/blocks/TimerBlock').then(m => ({ default: m.TimerBlock })))
const DiceBlock = lazy(() => import('@/components/blocks/DiceBlock').then(m => ({ default: m.DiceBlock })))
const SoundEffectsBlock = lazy(() => import('@/components/blocks/SoundEffectsBlock').then(m => ({ default: m.SoundEffectsBlock })))
const BackgroundMusicBlock = lazy(() => import('@/components/blocks/BackgroundMusicBlock').then(m => ({ default: m.BackgroundMusicBlock })))
const ProgressBarBlock = lazy(() => import('@/components/blocks/ProgressBarBlock').then(m => ({ default: m.ProgressBarBlock })))
const VoiceGeneratorBlock = lazy(() => import('@/components/blocks/VoiceGeneratorBlock').then(m => ({ default: m.VoiceGeneratorBlock })))

interface BlockNodeData {
  type: BlockType
  rotation: number
}

// Use a type assertion to satisfy React Flow v12's strict NodeProps constraint
type BlockNodeProps = NodeProps

// Loading placeholder
function BlockLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[rgba(255,255,255,0.65)] dark:bg-[rgba(30,30,50,0.75)] rounded-[20px]">
      <div className="animate-pulse text-text-muted dark:text-[#7A7A8A]">Loading...</div>
    </div>
  )
}

// Block content renderer
function BlockContent({ type }: { type: BlockType }) {
  switch (type) {
    case 'timer':
      return <TimerBlock />
    case 'dice':
      return <DiceBlock />
    case 'soundEffects':
      return <SoundEffectsBlock />
    case 'backgroundMusic':
      return <BackgroundMusicBlock />
    case 'progressBar':
      return <ProgressBarBlock />
    case 'voiceGenerator':
      return <VoiceGeneratorBlock />
    default:
      return null
  }
}

export const BlockNode = memo(function BlockNode(props: BlockNodeProps) {
  const { id, data, selected } = props
  const typedData = data as unknown as BlockNodeData
  const bringToFront = useCanvasStore((state) => state.bringToFront)
  const removeBlock = useCanvasStore((state) => state.removeBlock)

  const handleMouseDown = useCallback(() => {
    // Just bring block to front on any interaction
    // Do NOT call stopPropagation - React Flow handles drag prevention via noDragClassName
    bringToFront(id)
  }, [id, bringToFront])

  // Rotation transform
  const rotationStyle = typedData.rotation !== 0
    ? { transform: `rotate(${typedData.rotation}deg)` }
    : undefined

  return (
    // Use w-full h-full to fill React Flow's node container
    <div
      className={cn(
        'relative w-full h-full',
        'transition-shadow duration-200',
        selected && 'ring-2 ring-[#3BC9DB] ring-offset-2 ring-offset-transparent rounded-[20px]'
      )}
      style={rotationStyle}
      onPointerDownCapture={handleMouseDown}
    >
      {/* Delete button - appears when block is selected */}
      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeBlock(id)
          }}
          className="absolute -top-3 -right-3 z-[9999] w-8 h-8 rounded-full
                     bg-red-500 hover:bg-red-600 active:bg-red-700
                     text-white flex items-center justify-center
                     shadow-lg transition-colors cursor-pointer
                     nodrag nopan"
          title="Delete block"
          aria-label="Delete block"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Block content - the panels have their own GlassPanel styling */}
      <div className="w-full h-full overflow-hidden rounded-[20px]">
        <Suspense fallback={<BlockLoading />}>
          <BlockContent type={typedData.type} />
        </Suspense>
      </div>
    </div>
  )
})
