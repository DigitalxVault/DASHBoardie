'use client'

import { GlassPanel } from '@/components/ui/GlassPanel'
import { GlassButton } from '@/components/ui/GlassButton'
import { useAppStore } from '@/stores/appStore'
import { useCallback, useState, useEffect } from 'react'
import { Minus, Plus, Settings } from 'lucide-react'
import { createPortal } from 'react-dom'

// Color presets for the progress bar
const COLOR_PRESETS = [
  { name: 'Red', hex: '#FF6B6B' },
  { name: 'Orange', hex: '#FFA94D' },
  { name: 'Yellow', hex: '#FFD43B' },
  { name: 'Green', hex: '#69DB7C' },
  { name: 'Cyan', hex: '#3BC9DB' },
  { name: 'Purple', hex: '#B197FC' },
]

// Helper to create a lighter variant for gradient
function lightenColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const lighten = (c: number) => Math.min(255, c + 35)

  return `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`
}

// Settings Modal Component
interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentColor: string
  increment: number
  onColorChange: (color: string) => void
  onIncrementChange: (increment: number) => void
}

function SettingsModal({ isOpen, onClose, currentColor, increment, onColorChange, onIncrementChange }: SettingsModalProps) {
  const [tempIncrement, setTempIncrement] = useState(increment.toString())

  // Sync tempIncrement when increment prop changes
  useEffect(() => {
    setTempIncrement(increment.toString())
  }, [increment])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleIncrementBlur = useCallback(() => {
    const value = parseInt(tempIncrement, 10)
    if (!isNaN(value) && value >= 1 && value <= 50) {
      onIncrementChange(value)
    } else {
      setTempIncrement(increment.toString())
    }
  }, [tempIncrement, increment, onIncrementChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleIncrementBlur()
    }
  }, [handleIncrementBlur])

  if (!isOpen) return null

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <GlassPanel variant="frosted" padding="none" className="w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.1)]">
          <div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-[#F5F5FA]">
              Progress Bar Settings
            </h2>
            <p className="text-sm text-text-secondary dark:text-[#9A9AAA]">
              Customize appearance
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.5)] dark:hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Increment Setting */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-[#9A9AAA] mb-2">
              Increment Step
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={tempIncrement}
                onChange={(e) => setTempIncrement(e.target.value)}
                onBlur={handleIncrementBlur}
                onKeyDown={handleKeyDown}
                className="
                  flex-1 px-3 py-2 text-center text-base font-medium
                  bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(40,40,60,0.6)]
                  border border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.15)]
                  rounded-xl
                  text-text-primary dark:text-[#F5F5FA]
                  focus:outline-none focus:ring-2 focus:ring-[#3BC9DB]/50
                "
              />
              <span className="text-base text-text-muted dark:text-[#7A7A8A] font-medium">%</span>
            </div>
            <p className="text-xs text-text-muted dark:text-[#6A6A7A] mt-1">
              Each button press changes by this amount (1-50%)
            </p>
          </div>

          {/* Color Setting */}
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-[#9A9AAA] mb-2">
              Bar Color
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => onColorChange(preset.hex)}
                  className={`
                    w-10 h-10 rounded-full transition-all duration-150
                    ${currentColor === preset.hex
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1A1A2E] scale-110'
                      : 'hover:scale-110'
                    }
                  `}
                  style={{
                    backgroundColor: preset.hex,
                    boxShadow: currentColor === preset.hex ? `0 0 12px ${preset.hex}60` : undefined
                  }}
                  aria-label={`Select ${preset.name} color`}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.3)] dark:bg-[rgba(0,0,0,0.2)]">
          <GlassButton
            size="md"
            variant="primary"
            onClick={onClose}
          >
            Done
          </GlassButton>
        </div>
      </GlassPanel>
    </div>
  )

  // Portal to body so it's outside any CSS transforms from block scaling
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return null
}

export function ProgressBarPanel() {
  const { progressBar, incrementProgress, decrementProgress, setProgressBarIncrement, setProgressBarColor } = useAppStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Get the current color and its lighter variant for gradient
  const currentColor = progressBar.color || '#FF6B6B'
  const lighterColor = lightenColor(currentColor)

  return (
    <>
      <GlassPanel variant="frosted" className="h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.1)]">
            <h2 className="text-lg font-semibold text-text-primary dark:text-[#F5F5FA]">
              Progress Bar
            </h2>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         transition-colors duration-150 nodrag nopan
                         bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(50,50,70,0.5)]
                         text-[#6A6A7A] dark:text-[#9A9AAA]
                         hover:opacity-80"
              style={{ backgroundColor: `${currentColor}20`, color: currentColor }}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Display */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Percentage Text */}
            <div className="text-center mb-4">
              <span
                className="text-4xl font-bold"
                style={{ color: currentColor }}
              >
                {progressBar.value}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-6 rounded-full bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.1)] overflow-hidden mb-4">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
                style={{
                  width: `${progressBar.value}%`,
                  background: `linear-gradient(to right, ${currentColor}, ${lighterColor})`
                }}
              />
            </div>

            {/* Control Buttons - Custom styled for centering and visibility */}
            <div className="flex items-center justify-center gap-4">
              {/* Minus Button - Outline style */}
              <button
                onClick={decrementProgress}
                disabled={progressBar.value <= 0}
                className="w-14 h-14 rounded-full flex items-center justify-center
                           border-2 transition-all duration-200 nodrag nopan
                           hover:scale-105 active:scale-95
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  borderColor: currentColor,
                  color: currentColor,
                  backgroundColor: `${currentColor}15`
                }}
              >
                <Minus className="w-6 h-6" strokeWidth={2.5} />
              </button>

              {/* Plus Button - Filled style */}
              <button
                onClick={incrementProgress}
                disabled={progressBar.value >= 100}
                className="w-14 h-14 rounded-full flex items-center justify-center
                           transition-all duration-200 nodrag nopan
                           hover:scale-105 active:scale-95
                           disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundColor: currentColor,
                  color: 'white',
                  boxShadow: `0 4px 12px ${currentColor}40`
                }}
              >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentColor={currentColor}
        increment={progressBar.increment}
        onColorChange={setProgressBarColor}
        onIncrementChange={setProgressBarIncrement}
      />
    </>
  )
}
