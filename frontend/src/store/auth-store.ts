import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, TokenResponse } from "@/types/auth";
import apiClient from "@/lib/api/client";

interface AuthStore {
  user: User | null;
  tokens: TokenResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: TokenResponse | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => set({ tokens }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<TokenResponse>("/auth/login", { email, password });
          set({ tokens: response.data, isAuthenticated: true });
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<TokenResponse>("/auth/register", {
            email,
            password,
            full_name: fullName,
          });
          set({ tokens: response.data, isAuthenticated: true });
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const response = await apiClient.get<User>("/auth/me");
          set({ user: response.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ tokens: state.tokens }),
    }
  )
);
