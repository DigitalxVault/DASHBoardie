import type { ActivityLogEntry } from '@/stores/authStore'

/**
 * Log an activity event to the server
 */
export async function logActivity(
  entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch activity logs from the server
 */
export async function fetchActivityLogs(
  limit: number = 50,
  options?: {
    adminMode?: boolean
    days?: 30 | 60 | 90
  }
): Promise<{ success: boolean; data?: ActivityLogEntry[]; error?: string }> {
  try {
    const params = new URLSearchParams({ limit: String(limit) })
    if (options?.adminMode) params.set('admin', 'true')
    if (options?.days) params.set('days', String(options.days))

    const response = await fetch(`/api/activity/logs?${params}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `API error: ${response.status}`,
      }
    }

    const result = await response.json()
    // API returns { logs: [...], total: ... } - extract just the logs array
    return { success: true, data: result.logs || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Format timestamp for display
 */
export function formatActivityTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format activity details for display
 */
export function formatActivityDetails(entry: ActivityLogEntry): string {
  if (entry.action === 'login') {
    return 'Logged in'
  }
  if (entry.action === 'logout') {
    return 'Logged out'
  }
  if (entry.action === 'voice_generation') {
    const { voiceName, textLength, isBulk, bulkCount, success } = entry.details
    if (!success) {
      return `Failed: ${entry.details.error || 'Unknown error'}`
    }
    if (isBulk && bulkCount) {
      return `Generated ${bulkCount} files (${voiceName || 'Unknown voice'})`
    }
    const chars = textLength || 0
    return `Generated "${chars} chars" (${voiceName || 'Unknown voice'})`
  }
  return entry.action
}
