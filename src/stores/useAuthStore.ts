import { getSession, loginFunction } from "@/hooks/session/useSession";
import { AuthState, LoginData, Session } from "@/types/auth";
import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  session: null,
  login: async (loginData: LoginData) => {
    const session = await loginFunction(loginData);
    set({ isAuthenticated: true, session });
  },
  logout: async () => {
    await invoke("logout");
    set({ isAuthenticated: false, session: null });
  },
  setSession: async () => {
    const session = await getSession();
    set({ isAuthenticated: true, session });
  },
}));
