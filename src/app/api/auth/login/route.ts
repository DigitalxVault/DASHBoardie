import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return handleAuthRequest(request)
}

export async function POST(request: NextRequest) {
  return handleAuthRequest(request)
}

async function handleAuthRequest(request: NextRequest) {
  const clientId = process.env.OAUTH_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { error: 'OAuth client ID not configured' },
      { status: 500 }
    )
  }

  // Auto-detect redirect URI from request origin (works for both local and production)
  // Can be overridden with OAUTH_REDIRECT_URI env var if needed
  const redirectUri = process.env.OAUTH_REDIRECT_URI ||
    `${request.nextUrl.origin}/api/auth/callback/google`

  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15)

  // Create OAuth URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    prompt: 'select_account',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  // Return the authUrl for client-side redirect
  return NextResponse.json({ authUrl, state })
}
