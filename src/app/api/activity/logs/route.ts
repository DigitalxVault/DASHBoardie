import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { verifyAdminRequest } from '@/lib/admin'

const LOG_FILE = join(process.cwd(), '.activity-logs.json')

async function getLogs(): Promise<any[]> {
  try {
    if (existsSync(LOG_FILE)) {
      const data = await readFile(LOG_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading logs:', error)
  }
  return []
}

async function addLog(entry: any): Promise<void> {
  const logs = await getLogs()
  logs.unshift(entry)

  // Keep only last 5000 logs to prevent file from growing too large
  // This gives ~100 days at ~50 voice generations/day
  const trimmedLogs = logs.slice(0, 5000)

  try {
    await writeFile(LOG_FILE, JSON.stringify(trimmedLogs, null, 2))
  } catch (error) {
    console.error('Error writing logs:', error)
  }
}

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
  const days = parseInt(request.nextUrl.searchParams.get('days') || '90')
  const adminMode = request.nextUrl.searchParams.get('admin') === 'true'

  // Verify admin if requesting admin mode
  let isAdmin = false
  let currentUserId: string | undefined

  if (adminMode) {
    const verification = await verifyAdminRequest(request)
    if (!verification.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    isAdmin = true
  } else {
    // For non-admin, get current user ID for filtering login/logout
    const sessionToken = request.cookies.get('session')?.value
    if (sessionToken) {
      try {
        const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString())
        currentUserId = sessionData.user?.id
      } catch {
        // Session parse fails - no filtering
      }
    }
  }

  const logs = await getLogs()

  // Filter by date range
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
  const filteredLogs = logs.filter((log: any) => log.timestamp > cutoff)

  // For non-admin, filter login/logout to current user only
  let displayLogs = filteredLogs
  if (!isAdmin && currentUserId) {
    displayLogs = filteredLogs.filter((log: any) =>
      log.action === 'voice_generation' ||
      (log.action === 'login' && log.userId === currentUserId) ||
      (log.action === 'logout' && log.userId === currentUserId)
    )
  } else if (!isAdmin) {
    // No session - show only voice generations
    displayLogs = filteredLogs.filter((log: any) => log.action === 'voice_generation')
  }

  return NextResponse.json({
    logs: displayLogs.slice(0, limit),
    total: displayLogs.length,
    isAdmin,
    days,
  })
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
    const entry = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: body.userId,
      userEmail: body.userEmail,
      userName: body.userName || 'Unknown',
      action: body.action,
      timestamp: Date.now(),
      details: body.details || {},
    }

    // Add to persistent storage
    await addLog(entry)

    return NextResponse.json({ success: true, id: entry.id })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
