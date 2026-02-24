import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// User information from Google OAuth
export interface User {
  id: string
  email: string
  name: string
  picture?: string
  domain: string
}

// Activity log entry for tracking Voice Generator usage
export interface ActivityLogEntry {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: 'voice_generation' | 'login' | 'logout'
  timestamp: number
  details: {
    voiceName?: string
    textLength?: number
    isBulk?: boolean
    bulkCount?: number
    success: boolean
    error?: string
  }
}

// Session state
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({
        user,
        isAuthenticated: user !== null,
        isLoading: false
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      }),
    }),
    {
      name: 'dashboardie-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          get length() { return 0; },
          clear: () => {},
          key: () => null,
        } as Storage
      }),
      // Only persist user state, not loading state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
