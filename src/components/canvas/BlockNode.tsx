'use client'

import { memo, useCallback, lazy, Suspense } from 'react'
import type { NodeProps } from '@xyflow/react'
import { NodeResizer } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvasStore'
import { BLOCK_DEFAULTS, type BlockType } from '@/types/canvas'

// Lazy load block components to avoid circular dependencies
const TimerBlock = lazy(() => import('@/components/blocks/TimerBlock').then(m => ({ default: m.TimerBlock })))
const DiceBlock = lazy(() => import('@/components/blocks/DiceBlock').then(m => ({ default: m.DiceBlock })))
const SoundEffectsBlock = lazy(() => import('@/components/blocks/SoundEffectsBlock').then(m => ({ default: m.SoundEffectsBlock })))
const BackgroundMusicBlock = lazy(() => import('@/components/blocks/BackgroundMusicBlock').then(m => ({ default: m.BackgroundMusicBlock })))

interface BlockNodeData {
  type: BlockType
  rotation: number
  width: number
  height: number
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
    default:
      return null
  }
}

export const BlockNode = memo(function BlockNode(props: BlockNodeProps) {
  const { id, data, selected } = props
  const typedData = data as unknown as BlockNodeData
  const updateBlockSize = useCanvasStore((state) => state.updateBlockSize)
  const bringToFront = useCanvasStore((state) => state.bringToFront)

  const minSize = BLOCK_DEFAULTS[typedData.type].min

  const handleResizeEnd = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      updateBlockSize(id, {
        width: params.width,
        height: params.height,
      })
    },
    [id, updateBlockSize]
  )

  const handleMouseDown = useCallback(() => {
    bringToFront(id)
  }, [id, bringToFront])

  // Rotation transform
  const rotationStyle = typedData.rotation !== 0
    ? { transform: `rotate(${typedData.rotation}deg)` }
    : undefined

  return (
    <div
      className={cn(
        'relative',
        'transition-shadow duration-200',
        selected && 'ring-2 ring-[#3BC9DB] ring-offset-2 ring-offset-transparent rounded-[20px]'
      )}
      style={{
        width: typedData.width,
        height: typedData.height,
        ...rotationStyle,
      }}
      onMouseDown={handleMouseDown}
    >
      <NodeResizer
        minWidth={minSize.width}
        minHeight={minSize.height}
        isVisible={selected}
        lineClassName="!border-[#3BC9DB]"
        handleClassName="!w-3 !h-3 !bg-[#3BC9DB] !border-2 !border-white !rounded-md"
        onResizeEnd={handleResizeEnd}
      />

      {/* Block content - the panels have their own GlassPanel styling */}
      <div className="w-full h-full overflow-hidden rounded-[20px]">
        <Suspense fallback={<BlockLoading />}>
          <BlockContent type={typedData.type} />
        </Suspense>
      </div>
    </div>
  )
})
