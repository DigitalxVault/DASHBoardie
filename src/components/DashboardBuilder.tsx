'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useCanvasStore } from '@/stores/canvasStore'
import { DashboardCanvas } from '@/components/canvas'
import { FeatureNav } from '@/components/nav'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ContextMenu, useContextMenu } from '@/components/ui/ContextMenu'
import { useCanvasShortcuts } from '@/hooks/useCanvasShortcuts'
import { cn } from '@/lib/utils'

export function DashboardBuilder() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { contextMenuPosition, openContextMenu, closeContextMenu } = useContextMenu()

  // Enable keyboard shortcuts
  useCanvasShortcuts({ enabled: isHydrated })

  // Hydrate the canvas store on mount
  useEffect(() => {
    // Rehydrate the persisted store
    useCanvasStore.persist.rehydrate()
    setIsHydrated(true)
  }, [])

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5FA] to-[#EEEEF5] dark:from-[#1a1a2e] dark:to-[#151528]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#3BC9DB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6A6A7A] dark:text-[#9A9AAA] font-medium">
            Loading Dash-Boardie...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen w-screen flex overflow-hidden bg-gradient-to-br from-[#F5F5FA] to-[#EEEEF5] dark:from-[#1a1a2e] dark:to-[#151528]"
      onContextMenu={openContextMenu}
    >
      {/* Navigation Panel */}
      <FeatureNav />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header
          className={cn(
            'flex items-center justify-between px-4 py-3',
            'bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(30,30,50,0.5)]',
            'border-b border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.08)]',
            'backdrop-blur-[10px]'
          )}
        >
          <div className="flex items-center gap-3">
            {/* Company Logo */}
            <Image
              src="/images/BLACK FONTS.png"
              alt="Mages Studio"
              width={100}
              height={30}
              className="h-6 w-auto object-contain dark:invert dark:brightness-200"
              priority
            />
            <div className="h-5 w-px bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)]" />
            <div>
              <h1 className="text-lg font-bold text-[#2A2A3A] dark:text-[#F5F5FA]">
                Dash-Boardie
              </h1>
              <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA]">
                Dashboard Builder for Tabletop Gaming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#38D9A9] animate-pulse" />
              <span className="text-sm text-[#6A6A7A] dark:text-[#9A9AAA] font-medium">
                Ready
              </span>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <DashboardCanvas />
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu position={contextMenuPosition} onClose={closeContextMenu} />
    </div>
  )
}
