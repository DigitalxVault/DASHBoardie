// Canvas and Block type definitions for Dash-Boardie

export type BlockType = 'timer' | 'dice' | 'soundEffects' | 'backgroundMusic' | 'progressBar' | 'voiceGenerator'

export type BlockRotation = 0 | 90 | 180 | 270

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface BlockInstance {
  id: string
  type: BlockType
  position: Position
  size: Size
  rotation: BlockRotation
  zIndex: number
}

export interface CanvasViewport {
  x: number
  y: number
  zoom: number
}

// Block size constraints
export interface BlockSizeConstraints {
  default: Size
  min: Size
}

// Default sizes for each block type
export const BLOCK_DEFAULTS: Record<BlockType, BlockSizeConstraints> = {
  timer: {
    default: { width: 400, height: 450 },
    min: { width: 300, height: 350 },
  },
  dice: {
    default: { width: 350, height: 500 },
    min: { width: 280, height: 400 },
  },
  soundEffects: {
    default: { width: 450, height: 400 },
    min: { width: 350, height: 300 },
  },
  backgroundMusic: {
    default: { width: 400, height: 450 },
    min: { width: 320, height: 380 },
  },
  progressBar: {
    default: { width: 350, height: 280 },
    min: { width: 280, height: 220 },
  },
  voiceGenerator: {
    default: { width: 450, height: 520 },
    min: { width: 380, height: 450 },
  },
}

// Import Lucide icons for use in components
import { Timer, Dices, Volume2, Music, Gauge, AudioLines, type LucideIcon } from 'lucide-react'

// Block metadata for navigation and display
export interface BlockMetadata {
  name: string
  description: string
  icon: LucideIcon
  colorClass: string
  accentColor: string
}

export const BLOCK_METADATA: Record<BlockType, BlockMetadata> = {
  timer: {
    name: 'Timer',
    description: 'Countdown & stopwatch',
    icon: Timer,
    colorClass: 'text-[#3BC9DB] bg-[rgba(59,201,219,0.15)]',
    accentColor: '#3BC9DB',
  },
  dice: {
    name: 'Dice Roller',
    description: '2D6 with history',
    icon: Dices,
    colorClass: 'text-[#B197FC] bg-[rgba(177,151,252,0.15)]',
    accentColor: '#B197FC',
  },
  soundEffects: {
    name: 'Sound Effects',
    description: '10-button soundboard',
    icon: Volume2,
    colorClass: 'text-[#38D9A9] bg-[rgba(56,217,169,0.15)]',
    accentColor: '#38D9A9',
  },
  backgroundMusic: {
    name: 'Background Music',
    description: 'Track player with loop',
    icon: Music,
    colorClass: 'text-[#FF8A80] bg-[rgba(255,138,128,0.15)]',
    accentColor: '#FF8A80',
  },
  progressBar: {
    name: 'Progress Bar',
    description: 'Track progress 0-100%',
    icon: Gauge,
    colorClass: 'text-[#FF6B6B] bg-[rgba(255,107,107,0.15)]',
    accentColor: '#FF6B6B',
  },
  voiceGenerator: {
    name: 'Voice Generator',
    description: 'ElevenLabs TTS',
    icon: AudioLines,
    colorClass: 'text-[#9B59B6] bg-[rgba(155,89,182,0.15)]',
    accentColor: '#9B59B6',
  },
}

// Canvas configuration
export const CANVAS_CONFIG = {
  gridSize: 20,
  snapThreshold: 10,
  minZoom: 0.25,
  maxZoom: 2,
  defaultZoom: 1,
  zoomStep: 0.1,
} as const

// Context menu actions
export type ContextMenuAction =
  | 'duplicate'
  | 'delete'
  | 'rotateCW'
  | 'rotateCCW'
  | 'bringToFront'
  | 'sendToBack'

export interface ContextMenuOption {
  action: ContextMenuAction
  label: string
  icon: string
  shortcut?: string
  danger?: boolean
}

export const CONTEXT_MENU_OPTIONS: ContextMenuOption[] = [
  { action: 'duplicate', label: 'Duplicate', icon: 'Copy', shortcut: 'Ctrl+D' },
  { action: 'rotateCW', label: 'Rotate 90° CW', icon: 'RotateCw' },
  { action: 'rotateCCW', label: 'Rotate 90° CCW', icon: 'RotateCcw' },
  { action: 'bringToFront', label: 'Bring to Front', icon: 'ArrowUp' },
  { action: 'sendToBack', label: 'Send to Back', icon: 'ArrowDown' },
  { action: 'delete', label: 'Delete', icon: 'Trash2', shortcut: 'Del', danger: true },
]
