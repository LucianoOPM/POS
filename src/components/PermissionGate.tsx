import { ComponentChildren } from "preact";
import { useAuthStore } from "@/store/authStore";

interface PermissionGateProps {
  /** Permiso requerido (uno solo) */
  permission?: string;
  /** Permisos requeridos (al menos uno) */
  anyOf?: string[];
  /** Permisos requeridos (todos) */
  allOf?: string[];
  /** Contenido a mostrar si tiene permiso */
  children: ComponentChildren;
  /** Contenido alternativo si no tiene permiso */
  fallback?: ComponentChildren;
}

/**
 * Componente que muestra/oculta contenido basado en permisos del usuario
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (anyOf) {
    allowed = hasAnyPermission(anyOf);
  } else if (allOf) {
    allowed = hasAllPermissions(allOf);
  }

  return <>{allowed ? children : fallback}</>;
}
