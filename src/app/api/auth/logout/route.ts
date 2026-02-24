import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get current session for logging
    const sessionToken = request.cookies.get('session')?.value
    let user = null

    if (sessionToken) {
      try {
        const sessionData = JSON.parse(
          Buffer.from(sessionToken, 'base64').toString()
        )
        user = sessionData.user

        // Log the logout activity
        if (user) {
          const activityLog = {
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            action: 'logout' as const,
            timestamp: Date.now(),
            details: { success: true },
          }

          await fetch(`${request.nextUrl.origin}/api/activity/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activityLog),
          }).catch(err => console.error('Failed to log activity:', err))
        }
      } catch (err) {
        // Ignore session parsing errors during logout
      }
    }

    const response = NextResponse.json({ success: true })

    // Clear session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
