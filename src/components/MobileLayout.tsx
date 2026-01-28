'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useCanvasStore } from '@/stores/canvasStore'

interface MobileLayoutProps {
  canvasView: React.ReactNode
  listView: React.ReactNode
}

/**
 * Responsive layout component that switches between:
 * - Canvas view on tablets (≥768px)
 * - Scrollable list view on phones (<768px)
 */
export function MobileLayout({ canvasView, listView }: MobileLayoutProps) {
  const isTablet = useMediaQuery('(min-width: 768px)')
  const blocks = useCanvasStore(state => state.blocks)

  // On mobile (phone), show scrollable list of features
  // On tablet/desktop, show the full canvas
  if (!isTablet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5FA] to-[#EEEEF5] dark:from-[#1a1a2e] dark:to-[#151528]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 px-4 py-3 bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(30,30,50,0.8)] backdrop-blur-md border-b border-[rgba(255,255,255,0.3)] dark:border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#2A2A3A] dark:text-[#F5F5FA]">
                Dash-Boardie
              </h1>
              <p className="text-xs text-[#6A6A7A] dark:text-[#9A9AAA]">
                {blocks.length} {blocks.length === 1 ? 'feature' : 'features'} added
              </p>
            </div>
          </div>
        </header>

        {/* Mobile List View */}
        <div className="px-4 py-4 space-y-4 pb-safe">
          {listView}
        </div>

        {/* Empty State */}
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-[#3BC9DB] to-[#38D9A9] flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#2A2A3A] dark:text-[#F5F5FA] mb-2">
              No Features Yet
            </h2>
            <p className="text-sm text-[#6A6A7A] dark:text-[#9A9AAA]">
              Add features from the sidebar to customize your dashboard
            </p>
          </div>
        )}
      </div>
    )
  }

  // Tablet/Desktop Canvas View
  return <>{canvasView}</>
}
