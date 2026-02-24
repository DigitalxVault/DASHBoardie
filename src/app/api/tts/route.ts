import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

// Helper to log activity (non-blocking)
async function logVoiceGeneration(
  request: NextRequest,
  userId: string,
  userEmail: string,
  userName: string,
  voiceName: string,
  textLength: number,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    await fetch(`${request.nextUrl.origin}/api/activity/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userEmail,
        userName,
        action: 'voice_generation',
        timestamp: Date.now(),
        details: {
          voiceName,
          textLength,
          success,
          error,
        },
      }),
    }).catch(err => console.error('Failed to log activity:', err))
  } catch (err) {
    // Silently fail logging errors
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ElevenLabs API key not configured on server' },
      { status: 500 }
    )
  }

  let body: {
    text: string
    voiceId: string
    voiceName?: string
    userId?: string
    userEmail?: string
    userName?: string
    modelId?: string
    stability?: number
    similarityBoost?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const {
    text,
    voiceId,
    voiceName = 'Unknown',
    userId = 'anonymous',
    userEmail = 'anonymous@magesstudio.com.sg',
    userName = 'Anonymous',
    modelId = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.75
  } = body

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 })
  }

  if (!voiceId) {
    return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.detail?.message ||
        errorData.detail?.status ||
        errorData.message ||
        `ElevenLabs API error: ${response.status} ${response.statusText}`

      // Log failed generation
      logVoiceGeneration(request, userId, userEmail, userName, voiceName, text.length, false, errorMessage)

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

    // Log successful generation (non-blocking)
    logVoiceGeneration(request, userId, userEmail, userName, voiceName, text.length, true)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
