import { JSX } from "preact/jsx-runtime";

/**
 * Tipos relacionados con componentes UI compartidos
 */
/** Props del componente de paginación */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

/** Props del componente de icono de ordenamiento */
export interface SortIconProps {
  isSorted: false | "asc" | "desc";
}

/** Configuración de ruta */
export interface RouteConfig {
  path: string;
  component: () => JSX.Element;
  layout: "main" | "auth";
  requireAuth: boolean;
  title?: string;
  /** Permiso requerido para acceder a la ruta */
  requiredPermission?: string;
  /** Permisos requeridos (al menos uno) */
  requiredAnyPermission?: string[];
}

/** Producto adaptado para ventas (valores numéricos) */
export interface SalesProduct {
  id: number;
  name: string;
  code: string;
  price: number;
  cost: number;
  tax: number;
  stock: number;
  category: string;
}

export interface SalesViewProps {
  cart: { id: number }[];
  onAddToCart: (product: SalesProduct) => void;
  onStartPayment: () => void;
}