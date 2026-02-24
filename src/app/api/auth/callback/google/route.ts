import { NextRequest, NextResponse } from 'next/server'

// Allowed domain for authentication
const ALLOWED_DOMAIN = 'magesstudio.com.sg'

// Google OAuth endpoints
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle user denial
  if (error) {
    return NextResponse.redirect(
      new URL('/?error=' + encodeURIComponent(error), request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=' + encodeURIComponent('missing_code'), request.url)
    )
  }

  try {
    const clientId = process.env.OAUTH_CLIENT_ID
    const clientSecret = process.env.OAUTH_CLIENT_SECRET

    // Auto-detect redirect URI from request origin
    const redirectUri = process.env.OAUTH_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/auth/callback/google`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/?error=' + encodeURIComponent('server_config'), request.url)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(
        new URL('/?error=' + encodeURIComponent('token_exchange'), request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user info
    const userResponse = await fetch(USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL('/?error=' + encodeURIComponent('user_info'), request.url)
      )
    }

    const userData = await userResponse.json()
    const email = userData.email
    const domain = email?.split('@')[1]?.toLowerCase()

    // Verify domain
    if (domain !== ALLOWED_DOMAIN.toLowerCase()) {
      return NextResponse.redirect(
        new URL('/?error=' + encodeURIComponent('invalid_domain'), request.url)
      )
    }

    // Create user object
    const user = {
      id: userData.sub,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      domain: domain,
    }

    // Create session token (simple base64 encoding for now - in production use proper JWT)
    const sessionData = JSON.stringify({
      user,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    const sessionToken = Buffer.from(sessionData).toString('base64')

    // Log the login activity
    const activityLog = {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      action: 'login' as const,
      timestamp: Date.now(),
      details: { success: true },
    }

    // Store activity log (non-blocking)
    fetch(`${request.nextUrl.origin}/api/activity/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityLog),
    }).catch(err => console.error('Failed to log activity:', err))

    // Redirect to app with session token in cookie
    const response = NextResponse.redirect(new URL('/', request.url))

    // Set httpOnly cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/?error=' + encodeURIComponent('server_error'), request.url)
    )
  }
}
