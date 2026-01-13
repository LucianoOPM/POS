/**
 * Tipos relacionados con usuarios del sistema
 */

/** Usuario del sistema */
export interface UserRecord {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  profile_id: number;
  profile_name: string | null;
  created_at: string;
  updated_at: string;
}

/** Filtros para listar usuarios */
export interface UserFilter {
  status?: boolean;
  page: number;
  limit: number;
}

/** Respuesta de listado de usuarios */
export interface UserListResponse {
  users: UserRecord[];
  total_pages: number;
  total_items: number;
}

/** Perfil de usuario (rol) */
export interface Profile {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

/** Datos para crear un nuevo usuario */
export interface NewUser {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  profile_id: number;
  created_by: string;
}

/** Datos para actualizar un usuario */
export interface UpdateUser {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  profile_id?: number;
  is_active?: boolean;
  updated_by: string;
}
