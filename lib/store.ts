import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Define types for your store
interface User {
  id: string
  email: string
  name?: string
}

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // UI state
  isLoading: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  logout: () => void
}

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        theme: 'system' as const,
        
        // Actions
        setUser: (user: User | null) => set(
          { user, isAuthenticated: !!user }
        ),
        
        setLoading: (isLoading: boolean) => set(
          { isLoading }
        ),
        
        setTheme: (theme: 'light' | 'dark' | 'system') => set(
          { theme }
        ),
        
        logout: () => set(
          { user: null, isAuthenticated: false }
        ),
      }),
      {
        name: 'app-store',
        partialize: (state: AppState) => ({
          theme: state.theme,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
)

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useTheme = () => useAppStore((state) => state.theme)
export const useIsLoading = () => useAppStore((state) => state.isLoading)