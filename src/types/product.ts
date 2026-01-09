/**
 * Tipos relacionados con productos
 */

/** Producto completo (coincide con backend) */
export interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  code: string;
  stock: number;
  is_active: boolean;
  price: string; // Decimal from DB comes as string
  cost: string; // Decimal from DB comes as string
  tax: string; // Decimal from DB comes as string
}

/** Filtros para obtener productos */
export interface ProductFilter {
  status: boolean;
  page: number;
  limit: number;
}

/** Respuesta paginada de productos */
export interface ProductListResponse {
  products: Product[];
  total_pages: number;
  total_items: number;
}

/** Datos para crear un nuevo producto (API format) */
export interface NewProduct {
  name: string;
  category_id: number | null;
  code: string;
  stock: number;
  price: number;
  cost: number;
  tax: number;
  created_by: string;
}

/** Datos para actualizar un producto existente (API format) */
export interface UpdateProduct {
  name?: string;
  category_id?: number | null;
  code?: string;
  stock?: number;
  is_active?: boolean;
  price?: number;
  cost?: number;
  tax?: number;
  updated_by: string;
}

/** Estado del stock de un producto */
export interface StockStatus {
  label: string;
  color: string;
}

/** Estado del stock (usado en filtros) */
export type StockStatusType = "optimal" | "low" | "out";
