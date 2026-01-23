'use client'

import Image from 'next/image'
import { useAppStore } from '@/stores/appStore'

interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 120, height = 40, className = '' }: LogoProps) {
  const theme = useAppStore((state) => state.theme)

  // Determine which logo to show based on theme
  // For 'system', we need to check the actual applied theme via DOM
  const isDark = theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' &&
     document.documentElement.classList.contains('dark'))

  const logoSrc = isDark ? '/images/WHITE FONTS.png' : '/images/BLACK FONTS.png'

  return (
    <Image
      src={logoSrc}
      alt="RT Lofi"
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${className}`}
      priority
    />
  )
}
