import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value

  if (!sessionToken) {
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 401 }
    )
  }

  try {
    // Decode session token
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString()
    )

    // Check expiration
    if (sessionData.exp && Date.now() > sessionData.exp) {
      return NextResponse.json(
        { user: null, isAuthenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: sessionData.user,
      isAuthenticated: true,
    })
  } catch (error) {
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 401 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
}
