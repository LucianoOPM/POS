/**
 * Codigos de permisos del sistema
 * Mantener sincronizado con la migracion del backend
 */
export const PERMISSIONS = {
  // Ventas
  SALES_CREATE: "sales.create",
  SALES_VIEW: "sales.view",
  SALES_REFUND: "sales.refund",
  SALES_CANCEL: "sales.cancel",

  // Productos
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_EDIT: "products.edit",
  PRODUCTS_DELETE: "products.delete",

  // Categorias
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_EDIT: "categories.edit",
  CATEGORIES_DELETE: "categories.delete",

  // Reportes
  REPORTS_SALES: "reports.sales",
  REPORTS_INVENTORY: "reports.inventory",
  REPORTS_FINANCIAL: "reports.financial",

  // Usuarios
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",

  // Perfiles
  PROFILES_VIEW: "profiles.view",
  PROFILES_MANAGE: "profiles.manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
