/**
 * Tipos relacionados con autenticación y sesión
 */

/** Datos de login */
export interface LoginData {
  username: string;
  password: string;
}

/** Sesión de usuario */
export interface Session {
  user_id: string;
  username: string;
  profile_id: number;
  profile_name: string;
  email: string;
  permissions: string[];
}

/** Estado de autenticación */
export interface AuthState {
  // Estado
  session: Session | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;

  // Acciones
  login: (credentials: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;

  // Permisos
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
}

/** Usuario autenticado (derivado de Session) */
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  profileId?: number;
}
