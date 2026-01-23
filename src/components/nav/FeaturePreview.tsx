'use client'

import { Timer, Dices, Volume2, Music } from 'lucide-react'
import { type BlockType } from '@/types/canvas'
import { cn } from '@/lib/utils'

interface FeaturePreviewProps {
  type: BlockType
  className?: string
}

// Color mapping for each block type
const typeColors: Record<BlockType, { bg: string; icon: string }> = {
  timer: {
    bg: 'bg-[rgba(59,201,219,0.15)] dark:bg-[rgba(59,201,219,0.2)]',
    icon: 'text-[#3BC9DB]',
  },
  dice: {
    bg: 'bg-[rgba(177,151,252,0.15)] dark:bg-[rgba(177,151,252,0.2)]',
    icon: 'text-[#B197FC]',
  },
  soundEffects: {
    bg: 'bg-[rgba(56,217,169,0.15)] dark:bg-[rgba(56,217,169,0.2)]',
    icon: 'text-[#38D9A9]',
  },
  backgroundMusic: {
    bg: 'bg-[rgba(255,138,128,0.15)] dark:bg-[rgba(255,138,128,0.2)]',
    icon: 'text-[#FF8A80]',
  },
}

const typeIcons: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  timer: Timer,
  dice: Dices,
  soundEffects: Volume2,
  backgroundMusic: Music,
}

export function FeaturePreview({ type, className }: FeaturePreviewProps) {
  const colors = typeColors[type]
  const Icon = typeIcons[type]

  return (
    <div
      className={cn(
        'w-full aspect-[4/3] rounded-lg',
        'flex items-center justify-center',
        colors.bg,
        className
      )}
    >
      <Icon className={cn('w-8 h-8', colors.icon)} />
    </div>
  )
}
