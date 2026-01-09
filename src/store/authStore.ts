import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Session, LoginData, AuthState } from "@/types";

/**
 * Store global de autenticación usando Zustand
 *
 * Maneja el estado de la sesión del usuario en memoria.
 * La sesión se pierde al cerrar la aplicación (comportamiento deseado para seguridad).
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  session: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  /**
   * Inicia sesión del usuario
   */
  login: async (credentials: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const session = await invoke<Session>("login", { userData: credentials });
      set({
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error as string,
      });
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario
   */
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await invoke("logout");
      set({
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error as string,
      });
      throw error;
    }
  },

  /**
   * Verifica si existe una sesión activa
   * Se llama al iniciar la aplicación
   */
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await invoke<Session>("get_session");
      set({
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // No hay sesión activa, es normal
      set({
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Limpia el error del estado
   */
  clearError: () => set({ error: null }),

  /**
   * Verifica si el usuario tiene un permiso especifico
   */
  hasPermission: (code: string) => {
    const { session } = get();
    return session?.permissions.includes(code) ?? false;
  },

  /**
   * Verifica si el usuario tiene al menos uno de los permisos
   */
  hasAnyPermission: (codes: string[]) => {
    const { session } = get();
    if (!session) return false;
    return codes.some((code) => session.permissions.includes(code));
  },

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  hasAllPermissions: (codes: string[]) => {
    const { session } = get();
    if (!session) return false;
    return codes.every((code) => session.permissions.includes(code));
  },
}));
