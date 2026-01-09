/**
 * Tipos relacionados con el inventario y filtros
 */

import { StockStatusType } from "./product";

/** Filtros de inventario */
export interface InventoryFilters {
  categories: string[];
  stockStatus: StockStatusType[];
}

/** Opciones de paginación */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/** Opciones de ordenamiento */
export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}
