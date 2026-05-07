import { create } from 'zustand';
import { persist } from "zustand/middleware";
import type {User} from "../types.ts";

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;

  token: string;
  setToken: (token: string) => void;

  user: User
  setUser: (user: User) => void

  logout: () => void
}


export const useAuthStore = create<AuthState>()(
  persist(
      (set) => ({
        status: 'idle',
        setStatus: (status) => set({ status }),

        token: '',
        setToken: (token) => set({token}),

        user: {
          id: '',
          email: '',
          username: ''
        },
        setUser: (user) => set({user}),

        logout: () => set({
          status: 'idle',
          token: '',
          user: {
            id: '',
            email: '',
            username: ''
          }
        }),
      }),
      {
        name: 'modhub-auth',
      }
  )
);