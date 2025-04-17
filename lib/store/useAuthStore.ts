import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firestore'

type User = {
  uid: string
  email: string
  username: string
  score: number
  emailVerified: boolean
  isAdmin: boolean
}

type AuthState = {
  user: User | null
  setUser: (user: User) => void
  logout: () => Promise<void>
  isUserAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        try {
          await signOut(auth)
          set({ user: null })
        } catch (err) {
          console.error('Error logging out:', err)
        }
      },
      isUserAdmin: () => {
        const { user } = get()
        return user?.isAdmin === true
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)