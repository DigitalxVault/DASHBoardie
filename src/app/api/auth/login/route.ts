import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.OAUTH_CLIENT_ID
  const redirectUri = process.env.OAUTH_REDIRECT_URI

  if (!clientId) {
    return NextResponse.json(
      { error: 'OAuth client ID not configured' },
      { status: 500 }
    )
  }

  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15)

  // Create OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri || `${request.nextUrl.origin}/api/auth/callback/google`,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    prompt: 'select_account',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return NextResponse.json({ authUrl, state })
}
