/**
 * Tipos relacionados con categorías de productos
 */

/** Categoría de producto */
export interface Category {
  id: number;
  name: string;
  is_active: boolean;
}

/** Respuesta de lista de categorías */
export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

/** Datos para crear una nueva categoría */
export interface NewCategory {
  name: string;
  description?: string;
}

/** Datos para actualizar una categoría existente */
export interface UpdateCategory {
  id: number;
  name: string;
  description?: string;
}
