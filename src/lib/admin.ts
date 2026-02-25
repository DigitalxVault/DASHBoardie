import { NextRequest } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'eugene.tan@magesstudio.com.sg'

export function isAdmin(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export async function verifyAdminRequest(request: NextRequest): Promise<{
  isAdmin: boolean
  user?: { email: string; name: string; id: string }
  error?: string
}> {
  const sessionToken = request.cookies.get('session')?.value

  if (!sessionToken) {
    return { isAdmin: false, error: 'No session' }
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionToken, 'base64').toString()
    )

    if (sessionData.exp && Date.now() > sessionData.exp) {
      return { isAdmin: false, error: 'Session expired' }
    }

    const userEmail = sessionData.user?.email
    if (!userEmail) {
      return { isAdmin: false, error: 'No email in session' }
    }

    return {
      isAdmin: isAdmin(userEmail),
      user: {
        email: userEmail,
        name: sessionData.user?.name,
        id: sessionData.user?.id
      }
    }
  } catch (error) {
    return { isAdmin: false, error: 'Invalid session' }
  }
}
