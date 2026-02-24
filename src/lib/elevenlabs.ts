// ElevenLabs TTS client — calls server-side /api/tts proxy

export interface TTSOptions {
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

export interface TTSResult {
  success: boolean
  audioBlob?: Blob
  error?: string
}

/**
 * Generate speech via the server-side TTS proxy
 */
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voiceId,
    voiceName = 'Unknown',
    userId = 'anonymous',
    userEmail = 'anonymous@magesstudio.com.sg',
    userName = 'Anonymous',
    modelId = 'eleven_monolingual_v1',
    stability = 0.5,
    similarityBoost = 0.75,
  } = options

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
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId,
        voiceName,
        userId,
        userEmail,
        userName,
        modelId,
        stability,
        similarityBoost
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || `API error: ${response.status} ${response.statusText}`,
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
