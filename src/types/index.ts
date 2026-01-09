/**
 * Barrel export de todos los tipos
 * Permite importar desde @/types en lugar de @/types/product, etc.
 */

// Product types
export type {
  Product,
  NewProduct,
  UpdateProduct,
  ProductFilter,
  ProductListResponse,
  StockStatus,
  StockStatusType,
} from "./product";

// Auth types
export type { LoginData, AuthState, User, Session } from "./auth";

// Permission types
export { PERMISSIONS } from "./permissions";
export type { PermissionCode } from "./permissions";

// Category types
export type { Category, CategoryListResponse, NewCategory, UpdateCategory } from "./category";

// Cart types
export type {
  CartItem,
  PaymentMethod,
  SaleStatus,
  Sale,
  SaleItemRequest,
  CreateSaleRequest,
  CreateSaleResponse,
  PaymentMethodResponse,
} from "./cart";

// Inventory types
export type { InventoryFilters, PaginationOptions, SortOptions } from "./inventory";

// UI types
export type { PaginationProps, SortIconProps, RouteConfig, SalesViewProps, SalesProduct } from "./ui";

// Report types
export type {
  DateRange,
  ReportType,
  ExportFormat,
  SalesSummary,
  PaymentMethodSales,
  SaleRecord,
  ProductMovement,
  ProductMovementSummary,
  FinancialSummary,
  DailyFinancial,
  ReportFilters,
  ReportsStatsProps,
  ReportsToolbarProps,
  ReportsTabsProps,
} from "./reports";
