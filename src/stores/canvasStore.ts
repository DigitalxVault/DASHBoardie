import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  BlockInstance,
  BlockType,
  BlockRotation,
  CanvasViewport,
  Position,
  Size,
} from '@/types/canvas'
import { BLOCK_DEFAULTS, CANVAS_CONFIG } from '@/types/canvas'

// Generate unique ID
function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface CanvasState {
  // Block instances on canvas
  blocks: BlockInstance[]

  // Viewport state (pan/zoom)
  viewport: CanvasViewport

  // Selection state
  selectedBlockIds: string[]

  // UI state
  isNavCollapsed: boolean
  gridSize: number
  showGrid: boolean

  // Block actions
  addBlock: (type: BlockType, position: Position) => string
  removeBlock: (id: string) => void
  removeBlocks: (ids: string[]) => void
  updateBlock: (id: string, updates: Partial<Omit<BlockInstance, 'id' | 'type'>>) => void
  updateBlockPosition: (id: string, position: Position) => void
  updateBlockSize: (id: string, size: Size, position?: Position) => void
  rotateBlock: (id: string, direction: 'cw' | 'ccw') => void
  duplicateBlock: (id: string) => string | null
  duplicateBlocks: (ids: string[]) => string[]
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void

  // Selection actions
  selectBlock: (id: string, additive?: boolean) => void
  selectBlocks: (ids: string[]) => void
  deselectAll: () => void
  selectAll: () => void
  toggleBlockSelection: (id: string) => void

  // Viewport actions
  setViewport: (viewport: CanvasViewport) => void
  resetViewport: () => void

  // Canvas actions
  resetCanvas: () => void

  // UI actions
  toggleNav: () => void
  setNavCollapsed: (collapsed: boolean) => void
  setGridSize: (size: number) => void
  toggleGrid: () => void
}

// Default viewport
const defaultViewport: CanvasViewport = {
  x: 0,
  y: 0,
  zoom: CANVAS_CONFIG.defaultZoom,
}

// Create default blocks matching the original 2x2 layout
function createDefaultBlocks(): BlockInstance[] {
  return [
    {
      id: 'default-sfx',
      type: 'soundEffects',
      position: { x: 50, y: 50 },
      size: BLOCK_DEFAULTS.soundEffects.default,
      rotation: 0,
      zIndex: 1,
    },
    {
      id: 'default-music',
      type: 'backgroundMusic',
      position: { x: 520, y: 50 },
      size: BLOCK_DEFAULTS.backgroundMusic.default,
      rotation: 0,
      zIndex: 2,
    },
    {
      id: 'default-timer',
      type: 'timer',
      position: { x: 50, y: 520 },
      size: BLOCK_DEFAULTS.timer.default,
      rotation: 0,
      zIndex: 3,
    },
    {
      id: 'default-dice',
      type: 'dice',
      position: { x: 520, y: 520 },
      size: BLOCK_DEFAULTS.dice.default,
      rotation: 0,
      zIndex: 4,
    },
  ]
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      // Initial state
      blocks: createDefaultBlocks(),
      viewport: defaultViewport,
      selectedBlockIds: [],
      isNavCollapsed: false,
      gridSize: CANVAS_CONFIG.gridSize,
      showGrid: true,

      // Block actions
      addBlock: (type, position) => {
        const id = generateId()
        const defaults = BLOCK_DEFAULTS[type]
        const maxZIndex = Math.max(0, ...get().blocks.map((b) => b.zIndex))

        const newBlock: BlockInstance = {
          id,
          type,
          position: {
            x: Math.round(position.x / get().gridSize) * get().gridSize,
            y: Math.round(position.y / get().gridSize) * get().gridSize,
          },
          size: defaults.default,
          rotation: 0,
          zIndex: maxZIndex + 1,
        }

        set((state) => ({
          blocks: [...state.blocks, newBlock],
          selectedBlockIds: [id], // Select the new block
        }))

        return id
      },

      removeBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
          selectedBlockIds: state.selectedBlockIds.filter((sid) => sid !== id),
        }))
      },

      removeBlocks: (ids) => {
        const idSet = new Set(ids)
        set((state) => ({
          blocks: state.blocks.filter((b) => !idSet.has(b.id)),
          selectedBlockIds: state.selectedBlockIds.filter((sid) => !idSet.has(sid)),
        }))
      },

      updateBlock: (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }))
      },

      updateBlockPosition: (id, position) => {
        const gridSize = get().gridSize
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id
              ? {
                  ...b,
                  position: {
                    x: Math.round(position.x / gridSize) * gridSize,
                    y: Math.round(position.y / gridSize) * gridSize,
                  },
                }
              : b
          ),
        }))
      },

      updateBlockSize: (id, size, position) => {
        const block = get().blocks.find((b) => b.id === id)
        if (!block) return

        const minSize = BLOCK_DEFAULTS[block.type].min
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id
              ? {
                  ...b,
                  size: {
                    width: Math.max(minSize.width, size.width),
                    height: Math.max(minSize.height, size.height),
                  },
                  // Update position if provided (for corner resizes that shift position)
                  ...(position && {
                    position: { x: position.x, y: position.y },
                  }),
                }
              : b
          ),
        }))
      },

      rotateBlock: (id, direction) => {
        const rotations: BlockRotation[] = [0, 90, 180, 270]
        set((state) => ({
          blocks: state.blocks.map((b) => {
            if (b.id !== id) return b
            const currentIndex = rotations.indexOf(b.rotation)
            const newIndex =
              direction === 'cw'
                ? (currentIndex + 1) % 4
                : (currentIndex - 1 + 4) % 4
            return { ...b, rotation: rotations[newIndex] }
          }),
        }))
      },

      duplicateBlock: (id) => {
        const block = get().blocks.find((b) => b.id === id)
        if (!block) return null

        const newId = generateId()
        const maxZIndex = Math.max(0, ...get().blocks.map((b) => b.zIndex))
        const gridSize = get().gridSize

        const newBlock: BlockInstance = {
          ...block,
          id: newId,
          position: {
            x: block.position.x + gridSize,
            y: block.position.y + gridSize,
          },
          zIndex: maxZIndex + 1,
        }

        set((state) => ({
          blocks: [...state.blocks, newBlock],
          selectedBlockIds: [newId],
        }))

        return newId
      },

      duplicateBlocks: (ids) => {
        const blocks = get().blocks.filter((b) => ids.includes(b.id))
        if (blocks.length === 0) return []

        const newIds: string[] = []
        const maxZIndex = Math.max(0, ...get().blocks.map((b) => b.zIndex))
        const gridSize = get().gridSize

        const newBlocks = blocks.map((block, index) => {
          const newId = generateId()
          newIds.push(newId)
          return {
            ...block,
            id: newId,
            position: {
              x: block.position.x + gridSize,
              y: block.position.y + gridSize,
            },
            zIndex: maxZIndex + index + 1,
          }
        })

        set((state) => ({
          blocks: [...state.blocks, ...newBlocks],
          selectedBlockIds: newIds,
        }))

        return newIds
      },

      bringToFront: (id) => {
        const maxZIndex = Math.max(0, ...get().blocks.map((b) => b.zIndex))
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, zIndex: maxZIndex + 1 } : b
          ),
        }))
      },

      sendToBack: (id) => {
        const minZIndex = Math.min(...get().blocks.map((b) => b.zIndex))
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, zIndex: minZIndex - 1 } : b
          ),
        }))
      },

      // Selection actions
      selectBlock: (id, additive = false) => {
        set((state) => {
          if (additive) {
            if (state.selectedBlockIds.includes(id)) {
              return {
                selectedBlockIds: state.selectedBlockIds.filter((sid) => sid !== id),
              }
            }
            return {
              selectedBlockIds: [...state.selectedBlockIds, id],
            }
          }
          return {
            selectedBlockIds: [id],
          }
        })
      },

      selectBlocks: (ids) => {
        set({ selectedBlockIds: ids })
      },

      deselectAll: () => {
        set({ selectedBlockIds: [] })
      },

      selectAll: () => {
        set((state) => ({
          selectedBlockIds: state.blocks.map((b) => b.id),
        }))
      },

      toggleBlockSelection: (id) => {
        set((state) => {
          if (state.selectedBlockIds.includes(id)) {
            return {
              selectedBlockIds: state.selectedBlockIds.filter((sid) => sid !== id),
            }
          }
          return {
            selectedBlockIds: [...state.selectedBlockIds, id],
          }
        })
      },

      // Viewport actions
      setViewport: (viewport) => {
        set({ viewport })
      },

      resetViewport: () => {
        set({ viewport: defaultViewport })
      },

      // Canvas actions
      resetCanvas: () => {
        set({
          blocks: [],
          viewport: defaultViewport,
          selectedBlockIds: [],
        })
      },

      // UI actions
      toggleNav: () => {
        set((state) => ({ isNavCollapsed: !state.isNavCollapsed }))
      },

      setNavCollapsed: (collapsed) => {
        set({ isNavCollapsed: collapsed })
      },

      setGridSize: (size) => {
        set({ gridSize: size })
      },

      toggleGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }))
      },
    }),
    {
      name: 'dashboardie-canvas',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          length: 0,
          clear: () => {},
          key: () => null,
        } as Storage
      }),
      // Persist blocks and UI settings, but NOT viewport
      // Viewport resets each session so fitView can center modules properly
      partialize: (state) => ({
        blocks: state.blocks,
        isNavCollapsed: state.isNavCollapsed,
        gridSize: state.gridSize,
        showGrid: state.showGrid,
      }),
      skipHydration: true,
    }
  )
)
