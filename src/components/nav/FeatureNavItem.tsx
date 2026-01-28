'use client'

import { useCallback } from 'react'
import { GripVertical } from 'lucide-react'
import { type BlockType, BLOCK_METADATA } from '@/types/canvas'
import { cn } from '@/lib/utils'

interface FeatureNavItemProps {
  type: BlockType
  isCollapsed: boolean
}

export function FeatureNavItem({ type, isCollapsed }: FeatureNavItemProps) {
  const metadata = BLOCK_METADATA[type]

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.setData('application/dashboardie-block', type)
      event.dataTransfer.effectAllowed = 'copy'
    },
    [type]
  )

  if (isCollapsed) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        className={cn(
          'w-10 h-10 rounded-lg cursor-grab active:cursor-grabbing',
          'flex items-center justify-center',
          'bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(40,40,60,0.5)]',
          'border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.2)]',
          'hover:bg-[rgba(255,255,255,0.7)] dark:hover:bg-[rgba(50,50,70,0.6)]',
          'transition-all duration-150',
          'group'
        )}
        title={metadata.name}
      >
        <div
          className={cn(
            'w-6 h-6 rounded',
            'flex items-center justify-center',
            metadata.colorClass
          )}
        >
          <metadata.icon className="w-4 h-4" />
        </div>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'rounded-xl cursor-grab active:cursor-grabbing',
        'bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(40,40,60,0.5)]',
        'border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.2)]',
        'hover:bg-[rgba(255,255,255,0.7)] dark:hover:bg-[rgba(50,50,70,0.6)]',
        'hover:border-[rgba(59,201,219,0.5)]',
        'transition-all duration-150',
        'overflow-hidden',
        'group',
        'p-2'
      )}
    >
      {/* Compact horizontal layout: icon + text */}
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-[#8A8A9A] group-hover:text-[#3BC9DB] transition-colors flex-shrink-0" />

        {/* Icon badge */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex-shrink-0',
            'flex items-center justify-center',
            metadata.colorClass
          )}
        >
          <metadata.icon className="w-5 h-5" />
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[#2A2A3A] dark:text-[#F5F5FA] truncate">
            {metadata.name}
          </h4>
          <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA] truncate">
            {metadata.description}
          </p>
        </div>
      </div>
    </div>
  )
}
