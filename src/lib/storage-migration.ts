// Storage migration utility for Dash-Boardie
// Handles migration from legacy 'lofi-storage' to new 'dashboardie-storage'

const LEGACY_APP_KEY = 'lofi-storage'
const NEW_APP_KEY = 'dashboardie-storage'
const CANVAS_KEY = 'dashboardie-canvas'

interface LegacyAppState {
  state: {
    musicVolume: number
    effectsVolume: number
    soundEffectButtons: Array<{
      id: string
      name: string
      soundFile: string
    }>
    diceRolls: Array<{
      id: string
      dice1: number
      dice2: number
      sum: number
      timestamp: number
    }>
  }
  version?: number
}

interface NewAppState {
  state: {
    musicVolume: number
    effectsVolume: number
    soundEffectButtons: Array<{
      id: string
      name: string
      soundFile: string
    }>
    diceRolls: Array<{
      id: string
      dice1: number
      dice2: number
      sum: number
      timestamp: number
    }>
    theme: 'light' | 'dark'
  }
  version: number
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (typeof window === 'undefined') return false

  const legacyData = localStorage.getItem(LEGACY_APP_KEY)
  const newData = localStorage.getItem(NEW_APP_KEY)

  // Migration needed if legacy exists and new doesn't
  return legacyData !== null && newData === null
}

/**
 * Migrate from legacy storage to new storage format
 * Preserves all user settings (volumes, button configs, dice history)
 * Adds new theme preference defaulting to 'light'
 */
export function migrateStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const legacyData = localStorage.getItem(LEGACY_APP_KEY)
    const newData = localStorage.getItem(NEW_APP_KEY)

    // Don't migrate if new data already exists
    if (newData) {
      console.log('[Storage Migration] New storage already exists, skipping migration')
      return false
    }

    // Nothing to migrate
    if (!legacyData) {
      console.log('[Storage Migration] No legacy data found')
      return false
    }

    const parsed: LegacyAppState = JSON.parse(legacyData)

    // Create new app state with theme added
    const migratedAppState: NewAppState = {
      state: {
        ...parsed.state,
        theme: 'light', // Default to light theme
      },
      version: 1,
    }

    // Save migrated app state
    localStorage.setItem(NEW_APP_KEY, JSON.stringify(migratedAppState))

    // Create default canvas state if it doesn't exist
    if (!localStorage.getItem(CANVAS_KEY)) {
      const defaultCanvasState = createDefaultCanvasState()
      localStorage.setItem(CANVAS_KEY, JSON.stringify(defaultCanvasState))
    }

    console.log('[Storage Migration] Successfully migrated from lofi-storage to dashboardie-storage')
    return true
  } catch (error) {
    console.error('[Storage Migration] Migration failed:', error)
    return false
  }
}

/**
 * Create default canvas state matching original 2x2 layout
 */
function createDefaultCanvasState() {
  return {
    state: {
      blocks: [
        {
          id: 'default-sfx',
          type: 'soundEffects',
          position: { x: 50, y: 50 },
          size: { width: 450, height: 400 },
          rotation: 0,
          zIndex: 1,
        },
        {
          id: 'default-music',
          type: 'backgroundMusic',
          position: { x: 520, y: 50 },
          size: { width: 400, height: 450 },
          rotation: 0,
          zIndex: 2,
        },
        {
          id: 'default-timer',
          type: 'timer',
          position: { x: 50, y: 520 },
          size: { width: 400, height: 450 },
          rotation: 0,
          zIndex: 3,
        },
        {
          id: 'default-dice',
          type: 'dice',
          position: { x: 520, y: 520 },
          size: { width: 350, height: 500 },
          rotation: 0,
          zIndex: 4,
        },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedBlockIds: [],
      isNavCollapsed: false,
      gridSize: 20,
      showGrid: true,
    },
    version: 1,
  }
}

/**
 * Clear all Dash-Boardie storage (for testing/reset)
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(NEW_APP_KEY)
  localStorage.removeItem(CANVAS_KEY)
  console.log('[Storage] Cleared all Dash-Boardie storage')
}

/**
 * Clear legacy storage after successful migration
 */
export function clearLegacyStorage(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(LEGACY_APP_KEY)
  console.log('[Storage] Cleared legacy lofi-storage')
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number
  available: number
  percentage: number
} {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, percentage: 0 }
  }

  try {
    let used = 0
    for (const key of [NEW_APP_KEY, CANVAS_KEY, LEGACY_APP_KEY]) {
      const item = localStorage.getItem(key)
      if (item) {
        used += item.length * 2 // UTF-16 characters
      }
    }

    // Estimate available (most browsers allow ~5MB)
    const available = 5 * 1024 * 1024
    const percentage = (used / available) * 100

    return { used, available, percentage }
  } catch {
    return { used: 0, available: 0, percentage: 0 }
  }
}
