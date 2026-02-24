'use client'

import { useState, lazy, Suspense, useEffect } from 'react'
import { useCanvasStore } from '@/stores/canvasStore'

// Lazy load heavy canvas components
const DashboardCanvas = lazy(() => import('@/components/canvas').then(m => ({ default: m.DashboardCanvas })))

// Light components loaded normally
import { FeatureNav } from '@/components/nav'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Logo } from '@/components/ui/Logo'
import { ActivityLogButton } from '@/components/ui/ActivityLogButton'
import { UserAccountButton } from '@/components/ui/UserAccountButton'
import { ActivityLog } from '@/components/ui/ActivityLog'
import { LoginModal } from '@/components/ui/LoginModal'
import { Home } from 'lucide-react'
import { ContextMenu, useContextMenu } from '@/components/ui/ContextMenu'
import { useCanvasShortcuts } from '@/hooks/useCanvasShortcuts'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface DashboardBuilderProps {
  onReturnToWelcome?: () => void
}

export function DashboardBuilder({ onReturnToWelcome }: DashboardBuilderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const { contextMenuPosition, openContextMenu, closeContextMenu } = useContextMenu()
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { setUser, setLoading } = useAuthStore()

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          if (data.isAuthenticated) {
            setUser(data.user)
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isHydrated) {
      checkSession()
    }
  }, [isHydrated, setUser, setLoading])

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
            'border-b border-[rgba(255,255,255,0.6)] dark:border-[rgba(255,255,255,0.18)]',
            'backdrop-blur-[10px]'
          )}
        >
          <div className="flex items-center gap-3">
            {/* Home Button - returns to welcome screen */}
            {onReturnToWelcome && (
              <button
                onClick={onReturnToWelcome}
                className={cn(
                  'group flex items-center gap-2 px-3 py-2 rounded-xl',
                  'bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(40,40,60,0.6)]',
                  'border border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.12)]',
                  'hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-[rgba(50,50,70,0.7)]',
                  'hover:border-[#3BC9DB]/40 dark:hover:border-[#3BC9DB]/30',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[#3BC9DB]/30'
                )}
                title="Return to Welcome Screen"
                aria-label="Return to Welcome Screen"
              >
                <Home className="w-4 h-4 text-[#6A6A7A] dark:text-[#9A9AAA] group-hover:text-[#3BC9DB] transition-colors" />
                <span className="text-sm font-medium text-[#6A6A7A] dark:text-[#9A9AAA] group-hover:text-[#3BC9DB] transition-colors">
                  Home
                </span>
              </button>
            )}

            {/* Activity Log Button */}
            <ActivityLogButton onClick={() => setIsActivityLogOpen(true)} />

            <div className="h-6 w-px bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.08)]" />

            {/* Company Logo - theme-aware */}
            <Logo width={160} height={48} className="h-10 w-auto object-contain" />

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

            {/* User Account Button */}
            <UserAccountButton onClick={() => setIsLoginModalOpen(true)} />

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#3BC9DB] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <DashboardCanvas />
          </Suspense>
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu position={contextMenuPosition} onClose={closeContextMenu} />

      {/* Activity Log Modal */}
      <ActivityLog
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
      />

      {/* Login/Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}
