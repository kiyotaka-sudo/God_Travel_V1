import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store global Zustand — Authentification God Travel
 * Persiste le token JWT et l'utilisateur dans localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,       // { id, nom, prenom, email, role }
      agenceId: null,

      setAuth: (token, user) => set({ token, user, agenceId: user?.agenceId ?? null }),
      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user }, agenceId: user?.agenceId ?? state.agenceId })),
      logout: () => set({ token: null, user: null, agenceId: null }),
    }),
    {
      name: 'god-travel-auth',
    }
  )
)

