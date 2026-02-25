import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin'
import { sql } from '@/lib/db'

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

  // Calculate date cutoff
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)

  try {
    let logs: any[] = []

    if (isAdmin) {
      // Admin: Get all logs within date range
      const result = await sql`
        SELECT id, user_id as "userId", user_email as "userEmail",
               user_name as "userName", action, timestamp, details
        FROM activity_logs
        WHERE timestamp > ${cutoff}
        ORDER BY timestamp DESC
        LIMIT ${limit * 10}
      `
      logs = result
    } else if (currentUserId) {
      // Non-admin with session: voice generations + own login/logout
      const result = await sql`
        SELECT id, user_id as "userId", user_email as "userEmail",
               user_name as "userName", action, timestamp, details
        FROM activity_logs
        WHERE timestamp > ${cutoff}
          AND (action = 'voice_generation' OR user_id = ${currentUserId})
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `
      logs = result
    } else {
      // No session: only voice generations
      const result = await sql`
        SELECT id, user_id as "userId", user_email as "userEmail",
               user_name as "userName", action, timestamp, details
        FROM activity_logs
        WHERE timestamp > ${cutoff} AND action = 'voice_generation'
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `
      logs = result
    }

    // Parse details from JSONB
    logs = logs.map((log: any) => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }))

    return NextResponse.json({
      logs,
      total: logs.length,
      isAdmin,
      days,
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
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
    const entry = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: body.userId,
      userEmail: body.userEmail,
      userName: body.userName || 'Unknown',
      action: body.action,
      timestamp: Date.now(),
      details: body.details || {},
    }

    // Insert into database
    await sql`
      INSERT INTO activity_logs (id, user_id, user_email, user_name, action, timestamp, details)
      VALUES (${entry.id}, ${entry.userId}, ${entry.userEmail}, ${entry.userName},
              ${entry.action}, ${entry.timestamp}, ${JSON.stringify(entry.details)})
    `

    return NextResponse.json({ success: true, id: entry.id })
  } catch (error) {
    console.error('Error creating log:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
