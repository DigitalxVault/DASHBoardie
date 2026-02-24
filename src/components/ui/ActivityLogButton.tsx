'use client'

import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface ActivityLogButtonProps {
  onClick: () => void
}

export function ActivityLogButton({ onClick }: ActivityLogButtonProps) {
  const { user, isAuthenticated } = useAuthStore()
  const [hasRecentActivity, setHasRecentActivity] = useState(false)

  // Check if there's recent activity (within last 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) {
      setHasRecentActivity(false)
      return
    }

    const checkRecentActivity = async () => {
      try {
        const response = await fetch('/api/activity/logs?limit=1')
        if (response.ok) {
          const data = await response.json()
          if (data.logs && data.logs.length > 0) {
            const lastLog = data.logs[0]
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
            setHasRecentActivity(lastLog.timestamp > fiveMinutesAgo)
          }
        }
      } catch (error) {
        // Silently fail
      }
    }

    checkRecentActivity()
    const interval = setInterval(checkRecentActivity, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [isAuthenticated])

  return (
    <button
      onClick={onClick}
      disabled={!isAuthenticated}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-xl',
        'bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(40,40,60,0.6)]',
        'border border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.12)]',
        'hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-[rgba(50,50,70,0.7)]',
        'hover:border-[#9B59B6]/40 dark:hover:border-[#9B59B6]/30',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#9B59B6]/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'relative'
      )}
      title={isAuthenticated ? 'View Activity Log' : 'Sign in to view activity'}
    >
      <div className="relative">
        <Activity className={cn(
          'w-4 h-4 transition-colors',
          isAuthenticated
            ? 'text-[#9B59B6] group-hover:text-[#7D3C98]'
            : 'text-[#6A6A7A] dark:text-[#9A9AAA]'
        )} />
        {hasRecentActivity && isAuthenticated && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#38D9A9] rounded-full border-2 border-white dark:border-[#1A1A2E]" />
        )}
      </div>
      <span className={cn(
        'text-sm font-medium transition-colors',
        isAuthenticated
          ? 'text-[#6A6A7A] dark:text-[#9A9AAA] group-hover:text-[#9B59B6]'
          : 'text-[#6A6A7A] dark:text-[#9A9AAA]'
      )}>
        Activity Log
      </span>
    </button>
  )
}
