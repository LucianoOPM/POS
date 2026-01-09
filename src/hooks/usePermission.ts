import { useAuthStore } from "@/store/authStore";

/**
 * Hook para verificar si el usuario tiene un permiso especifico
 */
export function usePermission(code: string): boolean {
  return useAuthStore((state) => state.hasPermission(code));
}

/**
 * Hook para verificar si el usuario tiene al menos uno de los permisos
 */
export function useAnyPermission(codes: string[]): boolean {
  return useAuthStore((state) => state.hasAnyPermission(codes));
}

/**
 * Hook para verificar si el usuario tiene todos los permisos
 */
export function useAllPermissions(codes: string[]): boolean {
  return useAuthStore((state) => state.hasAllPermissions(codes));
}
