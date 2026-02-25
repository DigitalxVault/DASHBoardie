'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassPanel } from './GlassPanel'
import { useAuthStore } from '@/stores/authStore'
import { fetchActivityLogs, formatActivityTime, formatActivityDetails } from '@/lib/activity'
import type { ActivityLogEntry } from '@/stores/authStore'
import { Activity, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityLogProps {
  isOpen: boolean
  onClose: () => void
}

const ADMIN_EMAIL = 'eugene.tan@magesstudio.com.sg'

export function ActivityLog({ isOpen, onClose }: ActivityLogProps) {
  const { user } = useAuthStore()
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [dateRange, setDateRange] = useState<30 | 60 | 90>(90)

  // Check if user is admin and enable admin mode by default
  useEffect(() => {
    const checkAdminStatus = () => {
      const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      setIsAdminMode(isAdmin)
    }
    checkAdminStatus()
  }, [user])

  const fetchLogs = useCallback(async () => {
    if (!user) return
    setIsLoading(true)

    // For admin, fetch with admin mode and date filter
    const result = await fetchActivityLogs(
      isAdminMode ? 1000 : 50, // Higher limit for admin
      {
        adminMode: isAdminMode,
        days: dateRange
      }
    )

    if (result.success && result.data) {
      setLogs(result.data)
    }
    setIsLoading(false)
  }, [user, isAdminMode, dateRange])

  useEffect(() => {
    if (isOpen) {
      fetchLogs()
    }
  }, [isOpen, fetchLogs])

  // Refresh logs every 30 seconds when open
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [isOpen, fetchLogs])

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  if (!isOpen) return null

  // For admin mode, show all logs (server already filtered)
  // For non-admin, use client-side filter for login/logout
  const displayLogs = isAdminMode
    ? logs
    : logs.filter(log =>
        log.action === 'voice_generation' ||
        (log.action === 'login' && log.userId === user?.id) ||
        (log.action === 'logout' && log.userId === user?.id)
      )

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <GlassPanel
        variant="frosted"
        padding="none"
        className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#9B59B6]" />
            <h2 className="text-xl font-semibold text-text-primary">
              Activity Log
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.5)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 bg-[rgba(155,89,182,0.08)] border-b border-[rgba(0,0,0,0.06)]">
          <p className="text-sm text-text-secondary">
            {isAdminMode
              ? <>Showing activity for <span className="font-semibold text-[#38D9A9]">all users</span> (Admin Mode)</>
              : <>Showing activity for <span className="font-semibold text-[#9B59B6]">{user?.email}</span></>
            }
          </p>
        </div>

        {/* Admin Controls - Only visible for admin user */}
        {isAdminMode && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-[rgba(56,217,169,0.1)] border border-[rgba(56,217,169,0.3)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#38D9A9] uppercase tracking-wide">
                  Admin Mode
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Date Range Selector */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value) as 30 | 60 | 90)}
                  className="px-3 py-1 rounded-lg text-sm bg-white dark:bg-[rgba(40,40,60,0.8)] border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Log List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-[#9B59B6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayLogs.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">
              No activity recorded yet
            </p>
          ) : (
            <div className="space-y-2">
              {displayLogs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "rounded-xl bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(60,60,80,0.5)]",
                    "border border-[rgba(155,89,182,0.15)] hover:border-[rgba(155,89,182,0.3)]",
                    "transition-all cursor-pointer",
                    expandedId === log.id && "ring-2 ring-[rgba(155,89,182,0.2)]"
                  )}
                  onClick={() => toggleExpand(log.id)}
                >
                  {/* Summary Row */}
                  <div className="flex items-center gap-3 p-3">
                    {/* Action Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      log.action === 'voice_generation' && "bg-[rgba(155,89,182,0.15)] text-[#9B59B6]",
                      log.action === 'login' && "bg-[rgba(56,217,169,0.15)] text-[#38D9A9]",
                      log.action === 'logout' && "bg-[rgba(255,107,107,0.15)] text-[#FF6B6B]"
                    )}>
                      {log.action === 'voice_generation' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                      {log.action === 'login' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )}
                      {log.action === 'logout' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {formatActivityDetails(log)}
                      </p>
                      <div className="flex items-center gap-2">
                        {isAdminMode && (
                          <span className="text-xs text-[#9B59B6] bg-[rgba(155,89,182,0.1)] px-2 py-0.5 rounded">
                            {log.userEmail}
                          </span>
                        )}
                        <span className="text-xs text-text-muted">
                          {formatActivityTime(log.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Expand Chevron */}
                    {expandedId === log.id ? (
                      <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedId === log.id && (
                    <div className="px-3 pb-3 pt-0 border-t border-[rgba(0,0,0,0.06)] mt-1">
                      <div className="pt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-muted">User:</span>
                          <span className="text-text-primary font-medium">{log.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Email:</span>
                          <span className="text-text-primary font-medium">{log.userEmail}</span>
                        </div>
                        {log.action === 'voice_generation' && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Voice:</span>
                              <span className="text-text-primary font-medium">{log.details.voiceName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Text Length:</span>
                              <span className="text-text-primary font-medium">{log.details.textLength} characters</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Status:</span>
                              <span className={cn(
                                "font-medium",
                                log.details.success ? "text-[#38D9A9]" : "text-[#FF6B6B]"
                              )}>
                                {log.details.success ? "Success" : "Failed"}
                              </span>
                            </div>
                            {!log.details.success && (
                              <div className="flex justify-between">
                                <span className="text-text-muted">Error:</span>
                                <span className="text-[#FF6B6B] font-medium">{log.details.error}</span>
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex justify-between">
                          <span className="text-text-muted">Timestamp:</span>
                          <span className="text-text-primary font-medium">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.3)]">
          <span className="text-xs text-text-muted">
            {displayLogs.length} {displayLogs.length === 1 ? 'entry' : 'entries'}
          </span>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="text-sm font-medium text-[#9B59B6] hover:text-[#7D3C98] disabled:opacity-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </GlassPanel>
    </div>
  )
}
