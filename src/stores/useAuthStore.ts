import { AuthState } from "@/types/auth";
import { User } from "@/types/user";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (user: User) => {
    return set({ isAuthenticated: true, user });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
