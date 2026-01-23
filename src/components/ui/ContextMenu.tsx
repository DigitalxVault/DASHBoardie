'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Copy, Trash2, RotateCw, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBlockOperations } from '@/hooks/useBlockOperations'

interface Position {
  x: number
  y: number
}

interface ContextMenuProps {
  position: Position | null
  onClose: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  action: () => void
  danger?: boolean
}

export function ContextMenu({ position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    hasSelection,
    deleteSelected,
    duplicateSelected,
    rotateSelected,
    bringSelectedToFront,
    sendSelectedToBack,
  } = useBlockOperations()

  // Close on click outside
  useEffect(() => {
    if (!position) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Use timeout to avoid closing immediately on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [position, onClose])

  // Adjust position to stay in viewport
  const [adjustedPosition, setAdjustedPosition] = useState<Position | null>(null)

  useEffect(() => {
    if (!position || !menuRef.current) {
      setAdjustedPosition(position)
      return
    }

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let x = position.x
    let y = position.y

    // Adjust if menu would go off right edge
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 8
    }

    // Adjust if menu would go off bottom edge
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 8
    }

    setAdjustedPosition({ x, y })
  }, [position])

  if (!position || !hasSelection) return null

  const menuItems: MenuItem[] = [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      shortcut: '⌘D',
      action: () => {
        duplicateSelected()
        onClose()
      },
    },
    {
      id: 'rotateCW',
      label: 'Rotate 90° CW',
      icon: RotateCw,
      action: () => {
        rotateSelected('cw')
        onClose()
      },
    },
    {
      id: 'rotateCCW',
      label: 'Rotate 90° CCW',
      icon: RotateCcw,
      action: () => {
        rotateSelected('ccw')
        onClose()
      },
    },
    {
      id: 'bringToFront',
      label: 'Bring to Front',
      icon: ArrowUp,
      action: () => {
        bringSelectedToFront()
        onClose()
      },
    },
    {
      id: 'sendToBack',
      label: 'Send to Back',
      icon: ArrowDown,
      action: () => {
        sendSelectedToBack()
        onClose()
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      shortcut: 'Del',
      danger: true,
      action: () => {
        deleteSelected()
        onClose()
      },
    },
  ]

  const displayPosition = adjustedPosition || position

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50',
        'min-w-[180px]',
        'bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(30,30,50,0.95)]',
        'backdrop-blur-[20px]',
        'border border-[rgba(255,255,255,0.85)] dark:border-[rgba(255,255,255,0.12)]',
        'rounded-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        'py-1.5',
        'animate-in fade-in-0 zoom-in-95 duration-150'
      )}
      style={{
        left: displayPosition.x,
        top: displayPosition.y,
      }}
    >
      {menuItems.map((item, index) => (
        <div key={item.id}>
          {item.id === 'delete' && (
            <div className="my-1 h-px bg-[rgba(138,138,154,0.2)] dark:bg-[rgba(255,255,255,0.1)]" />
          )}
          <button
            onClick={item.action}
            className={cn(
              'w-full px-3 py-2 flex items-center gap-3',
              'text-sm text-left',
              'transition-colors duration-100',
              item.danger
                ? [
                    'text-[#FF6B6B]',
                    'hover:bg-[rgba(255,107,107,0.1)]',
                  ]
                : [
                    'text-[#2A2A3A] dark:text-[#F5F5FA]',
                    'hover:bg-[rgba(59,201,219,0.1)]',
                    'hover:text-[#3BC9DB]',
                  ]
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-[#8A8A9A] dark:text-[#6A6A7A]">
                {item.shortcut}
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}

// Hook to manage context menu state
export function useContextMenu() {
  const [contextMenuPosition, setContextMenuPosition] = useState<Position | null>(null)

  const openContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenuPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null)
  }, [])

  return {
    contextMenuPosition,
    openContextMenu,
    closeContextMenu,
  }
}
