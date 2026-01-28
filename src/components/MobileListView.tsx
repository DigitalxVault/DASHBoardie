'use client'

import { useState, type ReactNode } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { useCanvasStore } from '@/stores/canvasStore'
import { TimerPanel } from '@/components/TimerPanel'
import { DicePanel } from '@/components/DicePanel'
import { SoundEffectsPanel } from '@/components/SoundEffectsPanel'
import { BackgroundMusic } from '@/components/BackgroundMusic'

interface MobileBlockCardProps {
  id: string
  title: string
  icon: ReactNode
  children: ReactNode
  color?: string
}

function MobileBlockCard({ title, icon, children, color = '#3BC9DB' }: MobileBlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <GlassPanel className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[rgba(255,255,255,0.3)] dark:bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(255,255,255,0.5)] dark:hover:bg-[rgba(0,0,0,0.3)] transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color }}>
          {icon}
        </div>
        <span className="flex-1 text-left font-semibold text-[#2A2A3A] dark:text-[#F5F5FA]">
          {title}
        </span>
        <svg
          className={`w-5 h-5 text-[#6A6A7A] dark:text-[#9A9AAA] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </GlassPanel>
  )
}

export function MobileListView() {
  const blocks = useCanvasStore(state => state.blocks)

  // Filter blocks by type and render corresponding panel
  const timerBlocks = blocks.filter(b => b.type === 'timer')
  const diceBlocks = blocks.filter(b => b.type === 'dice')
  const soundBlocks = blocks.filter(b => b.type === 'soundEffects')
  const musicBlocks = blocks.filter(b => b.type === 'backgroundMusic')

  return (
    <div className="space-y-4">
      {/* Timer Blocks */}
      {timerBlocks.map((block, index) => (
        <MobileBlockCard
          key={block.id}
          id={block.id}
          title={`Timer ${timerBlocks.length > 1 ? index + 1 : ''}`}
          color="#3BC9DB"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <TimerPanel />
        </MobileBlockCard>
      ))}

      {/* Dice Blocks */}
      {diceBlocks.map((block, index) => (
        <MobileBlockCard
          key={block.id}
          id={block.id}
          title={`Dice ${diceBlocks.length > 1 ? index + 1 : ''}`}
          color="#9B59B6"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        >
          <DicePanel />
        </MobileBlockCard>
      ))}

      {/* Sound Effects Blocks */}
      {soundBlocks.map((block, index) => (
        <MobileBlockCard
          key={block.id}
          id={block.id}
          title={`Sound Effects ${soundBlocks.length > 1 ? index + 1 : ''}`}
          color="#E74C3C"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          }
        >
          <SoundEffectsPanel />
        </MobileBlockCard>
      ))}

      {/* Background Music Blocks */}
      {musicBlocks.map((block, index) => (
        <MobileBlockCard
          key={block.id}
          id={block.id}
          title={`Music ${musicBlocks.length > 1 ? index + 1 : ''}`}
          color="#38D9A9"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          }
        >
          <BackgroundMusic />
        </MobileBlockCard>
      ))}

      {/* No blocks message */}
      {blocks.length === 0 && (
        <div className="text-center py-8 text-[#6A6A7A] dark:text-[#9A9AAA]">
          <p className="text-sm">
            Drag features from the sidebar to add them to your dashboard
          </p>
        </div>
      )}
    </div>
  )
}
