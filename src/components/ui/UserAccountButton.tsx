'use client'

import { useState, useEffect } from 'react'
import { User, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface UserAccountButtonProps {
  onClick: () => void
}

export function UserAccountButton({ onClick }: UserAccountButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-xl',
        'bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(40,40,60,0.6)]',
        'border border-[rgba(255,255,255,0.7)] dark:border-[rgba(255,255,255,0.12)]',
        'hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-[rgba(50,50,70,0.7)]',
        'hover:border-[#3BC9DB]/40 dark:hover:border-[#3BC9DB]/30',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#3BC9DB]/30'
      )}
      title={isAuthenticated ? 'Manage account' : 'Sign in'}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-[#6A6A7A] dark:text-[#9A9AAA] animate-spin" />
      ) : user?.picture ? (
        <img
          src={user.picture}
          alt={user.name}
          className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)]"
        />
      ) : (
        <User className={cn(
          'w-4 h-4 transition-colors',
          isAuthenticated
            ? 'text-[#3BC9DB] group-hover:text-[#2BB8D4]'
            : 'text-[#6A6A7A] dark:text-[#9A9AAA]'
        )} />
      )}
      <span className={cn(
        'text-sm font-medium transition-colors',
        isAuthenticated
          ? 'text-[#6A6A7A] dark:text-[#9A9AAA] group-hover:text-[#3BC9DB]'
          : 'text-[#6A6A7A] dark:text-[#9A9AAA]'
      )}>
        {isAuthenticated ? user?.name?.split(' ')[0] : 'Sign In'}
      </span>
    </button>
  )
}
