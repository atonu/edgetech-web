// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDto } from '@/lib/api';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: UserDto, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('et_token', token);
        set({ user, token, isAuthenticated: true, isHydrated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('et_token');
        set({ user: null, token: null, isAuthenticated: false, isHydrated: true });
      },
      isAdmin: () => get().user?.role === 'Admin',
    }),
    {
      name: 'et-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          if (state.token && typeof window !== 'undefined') {
            localStorage.setItem('et_token', state.token);
          }
        }
      },
    }
  )
);
