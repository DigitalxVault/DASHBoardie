import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

  // Keep only last 1000 logs to prevent file from growing too large
  const trimmedLogs = logs.slice(0, 1000)

  try {
    await writeFile(LOG_FILE, JSON.stringify(trimmedLogs, null, 2))
  } catch (error) {
    console.error('Error writing logs:', error)
  }
}

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
  const logs = await getLogs()

  return NextResponse.json({
    logs: logs.slice(0, limit),
    total: logs.length,
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
