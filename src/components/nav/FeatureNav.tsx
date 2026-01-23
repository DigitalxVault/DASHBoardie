'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCanvasStore } from '@/stores/canvasStore'
import { type BlockType, BLOCK_METADATA } from '@/types/canvas'
import { cn } from '@/lib/utils'
import { FeatureNavItem } from './FeatureNavItem'

const BLOCK_TYPES: BlockType[] = ['timer', 'dice', 'soundEffects', 'backgroundMusic']

interface FeatureNavProps {
  className?: string
}

export function FeatureNav({ className }: FeatureNavProps) {
  const isNavCollapsed = useCanvasStore((state) => state.isNavCollapsed)
  const toggleNav = useCanvasStore((state) => state.toggleNav)

  return (
    <div
      className={cn(
        'h-full flex flex-col',
        'bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(30,30,50,0.8)]',
        'backdrop-blur-[20px]',
        'border-r border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.12)]',
        'shadow-[4px_0_16px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_16px_rgba(0,0,0,0.2)]',
        'transition-all duration-300 ease-in-out',
        isNavCollapsed ? 'w-[64px]' : 'w-[280px]',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 p-4',
          'border-b border-[rgba(138,138,154,0.15)] dark:border-[rgba(255,255,255,0.08)]',
          isNavCollapsed && 'justify-center'
        )}
      >
        {!isNavCollapsed && (
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#2A2A3A] dark:text-[#F5F5FA]">
              Features
            </h2>
            <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA]">
              Drag to canvas
            </p>
          </div>
        )}
        <button
          onClick={toggleNav}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            'bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(50,50,70,0.5)]',
            'border border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.1)]',
            'hover:bg-[rgba(59,201,219,0.15)] hover:border-[rgba(59,201,219,0.3)]',
            'text-[#6A6A7A] dark:text-[#9A9AAA] hover:text-[#3BC9DB]',
            'transition-all duration-150'
          )}
          aria-label={isNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isNavCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Feature list */}
      <div
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'p-3',
          isNavCollapsed ? 'space-y-2' : 'space-y-3'
        )}
      >
        {BLOCK_TYPES.map((type) => (
          <FeatureNavItem
            key={type}
            type={type}
            isCollapsed={isNavCollapsed}
          />
        ))}
      </div>

      {/* Footer hint */}
      {!isNavCollapsed && (
        <div className="p-3 border-t border-[rgba(138,138,154,0.15)] dark:border-[rgba(255,255,255,0.08)]">
          <p className="text-xs text-center text-[#8A8A9A] dark:text-[#7A7A8A]">
            Drag items onto the canvas to add them
          </p>
        </div>
      )}
    </div>
  )
}
