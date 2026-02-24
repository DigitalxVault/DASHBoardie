// Auth utility functions

export interface LoginResult {
  success: boolean
  error?: string
}

/**
 * Initiate Google OAuth login flow
 * Redirects user to Google's consent screen
 */
export function loginWithGoogle(): void {
  const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || `${window.location.origin}/api/auth/callback/google`

  if (!clientId) {
    console.error('OAuth client ID not configured')
    return
  }

  // Generate state parameter for CSRF protection
  const state = generateState()

  // Store state in sessionStorage for verification in callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state)
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    // Prompt user to select account if they have multiple
    prompt: 'select_account',
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

/**
 * Verify OAuth state parameter
 */
export function verifyState(state: string): boolean {
  const storedState = typeof window !== 'undefined'
    ? sessionStorage.getItem('oauth_state')
    : null

  if (storedState) {
    sessionStorage.removeItem('oauth_state')
    return state === storedState
  }

  return false
}

/**
 * Validate email domain
 */
export function isValidDomain(email: string, allowedDomain: string): boolean {
  const emailDomain = email.split('@')[1]?.toLowerCase()
  return emailDomain === allowedDomain.toLowerCase()
}
