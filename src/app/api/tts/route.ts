import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

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

  const { text, voiceId, modelId = 'eleven_monolingual_v1', stability = 0.5, similarityBoost = 0.75 } = body

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
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()

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
