// ElevenLabs API service for text-to-speech generation

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface TTSOptions {
  text: string
  voiceId: string
  modelId?: string
  stability?: number
  similarityBoost?: number
}

export interface TTSResult {
  success: boolean
  audioBlob?: Blob
  error?: string
}

/**
 * Get the ElevenLabs API key from environment variables
 */
export function getApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
}

/**
 * Check if the API key is configured
 */
export function isApiKeyConfigured(): boolean {
  const key = getApiKey()
  return Boolean(key && key.length > 0)
}

/**
 * Generate speech from text using ElevenLabs API
 */
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voiceId,
    modelId = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.75,
  } = options

  const apiKey = getApiKey()

  if (!apiKey) {
    return {
      success: false,
      error: 'API key not configured. Add NEXT_PUBLIC_ELEVENLABS_API_KEY to .env.local',
    }
  }

  if (!text.trim()) {
    return {
      success: false,
      error: 'Text cannot be empty',
    }
  }

  if (!voiceId) {
    return {
      success: false,
      error: 'Voice ID is required',
    }
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
      const errorMessage = errorData.detail?.message ||
                          errorData.detail?.status ||
                          errorData.message ||
                          `API error: ${response.status} ${response.statusText}`
      return {
        success: false,
        error: errorMessage,
      }
    }

    const audioBlob = await response.blob()
    return { success: true, audioBlob }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Download a blob as a file
 */
export function downloadAudio(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // Don't add .mp3 if it's already a complete filename (like .zip)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Create a safe filename from text (first few words)
 */
export function createFilenameFromText(text: string, index?: number): string {
  // Get first few words, max 30 chars
  const words = text.trim().split(/\s+/).slice(0, 5).join('_')
  const safe = words
    .replace(/[^a-zA-Z0-9_]/g, '')
    .substring(0, 30)

  const prefix = index !== undefined ? `${String(index + 1).padStart(3, '0')}_` : ''
  return `${prefix}${safe || 'audio'}.mp3`
}

/**
 * Parse a text file into sentences (split by newlines)
 */
export function parseTextFile(content: string): string[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * Delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
