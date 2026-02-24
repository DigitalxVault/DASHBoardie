'use client'

import { useState, useEffect, useMemo } from 'react'
import { GlassPanel } from './GlassPanel'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuthStore, type User } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { user, logout, isLoading } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleLogin = async () => {
    try {
      // Call server API to get the OAuth URL (keeps client ID server-side)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
      })

      if (!response.ok) {
        console.error('Failed to get OAuth URL')
        return
      }

      const { authUrl, state } = await response.json()

      // Store state for CSRF verification
      sessionStorage.setItem('oauth_state', state)

      // Redirect to Google
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      onClose()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Escape key closes modal
  useMemo(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <GlassPanel
        variant="frosted"
        padding="none"
        className="max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {user ? 'Account' : 'Sign In'}
            </h2>
            <p className="text-sm text-text-secondary font-medium">
              {user ? 'Manage your session' : 'Access Voice Generator'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.5)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#9B59B6] animate-spin mb-3" />
              <p className="text-sm text-text-secondary">Checking session...</p>
            </div>
          ) : user ? (
            // Logged in state
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(155,89,182,0.08)] border border-[rgba(155,89,182,0.2)]">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-14 h-14 rounded-full border-2 border-[#9B59B6]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#9B59B6] flex items-center justify-center text-white text-xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{user.name}</p>
                  <p className="text-sm text-text-secondary truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-[rgba(0,0,0,0.06)]">
                  <span className="text-text-muted">Domain:</span>
                  <span className="font-medium text-text-primary">{user.domain}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[rgba(0,0,0,0.06)]">
                  <span className="text-text-muted">Status:</span>
                  <span className="font-medium text-[#38D9A9]">Authenticated</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "w-full mt-4 flex items-center justify-center gap-2 px-4 py-3",
                  "rounded-xl font-medium text-white transition-all",
                  "bg-[#FF6B6B] hover:bg-[#E85555]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            // Logged out state
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(155,89,182,0.15)] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#9B59B6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Sign in with Google
                </h3>
                <p className="text-sm text-text-secondary max-w-xs mx-auto">
                  Sign in with your <strong>@magesstudio.com.sg</strong> account to access the Voice Generator and track usage.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(255,107,107,0.08)] border border-[rgba(255,107,107,0.2)]">
                <p className="text-xs text-[#FF6B6B] font-medium">
                  Only accounts with <strong>@magesstudio.com.sg</strong> domain are allowed.
                </p>
              </div>

              <button
                onClick={handleLogin}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-4 py-3",
                  "rounded-xl font-medium transition-all",
                  "bg-white dark:bg-[rgba(40,40,60,0.8)]",
                  "border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]",
                  "hover:bg-[rgba(255,255,255,0.9)] dark:hover:bg-[rgba(50,50,70,0.9)]",
                  "shadow-sm hover:shadow"
                )}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-text-primary">Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  )
}
