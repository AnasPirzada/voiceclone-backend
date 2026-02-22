import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, TokenResponse } from "@/types/auth";
import apiClient from "@/lib/api/client";

function setAuthCookie(hasAuth: boolean) {
  if (typeof document !== "undefined") {
    if (hasAuth) {
      document.cookie = "vc-auth=1; path=/; max-age=604800; SameSite=Lax";
    } else {
      document.cookie = "vc-auth=; path=/; max-age=0; SameSite=Lax";
    }
  }
}

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
      setTokens: (tokens) => {
        setAuthCookie(!!tokens);
        set({ tokens });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post<TokenResponse>("/auth/login", { email, password });
          setAuthCookie(true);
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
          setAuthCookie(true);
          set({ tokens: response.data, isAuthenticated: true });
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        setAuthCookie(false);
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const response = await apiClient.get<User>("/auth/me");
          set({ user: response.data, isAuthenticated: true });
        } catch {
          setAuthCookie(false);
          set({ user: null, isAuthenticated: false, tokens: null });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ tokens: state.tokens }),
      onRehydrateStorage: () => (state) => {
        // When store rehydrates from localStorage, restore cookie
        if (state?.tokens) {
          setAuthCookie(true);
        }
      },
    }
  )
);
