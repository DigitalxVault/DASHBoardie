import { NextRequest, NextResponse } from 'next/server'
import type { ActivityLogEntry } from '@/stores/authStore'

// In-memory activity log storage
// In production, this should be replaced with a database
const activityLogs: ActivityLogEntry[] = []

// Keep logs in memory for 30 days
const LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

// Clean up old logs periodically
function cleanOldLogs() {
  const cutoff = Date.now() - LOG_RETENTION_MS
  const beforeLength = activityLogs.length
  for (let i = activityLogs.length - 1; i >= 0; i--) {
    if (activityLogs[i].timestamp < cutoff) {
      activityLogs.splice(i, 1)
    }
  }
  if (activityLogs.length !== beforeLength) {
    console.log(`Cleaned ${beforeLength - activityLogs.length} old logs`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.userId || !body.userEmail || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create activity log entry
    const entry: ActivityLogEntry = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: body.userId,
      userEmail: body.userEmail,
      userName: body.userName || 'Unknown',
      action: body.action,
      timestamp: Date.now(),
      details: body.details || {},
    }

    // Add to in-memory storage
    activityLogs.unshift(entry)

    // Periodically clean old logs (1 in 20 chance)
    if (Math.random() < 0.05) {
      cleanOldLogs()
    }

    return NextResponse.json({ success: true, id: entry.id })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// GET to retrieve logs (for debugging/admin)
export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

  return NextResponse.json({
    logs: activityLogs.slice(0, limit),
    total: activityLogs.length,
  })
}
