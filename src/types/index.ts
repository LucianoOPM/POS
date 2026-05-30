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
  LowStockProduct,
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

// User types
export type { UserRecord, UserFilter, UserListResponse, Profile, NewUser, UpdateUser } from "./user";

// Refund types
export type {
  RefundRecord,
  RefundDetailRecord,
  RefundWithDetails,
  RefundListResponse,
  RefundFilters,
  CreateRefundRequest,
  RefundItemRequest,
  RefundsTableProps,
  RefundsToolbarProps,
  SaleItemForRefund,
  SaleForRefund,
  RecentSale,
  RefundItemSelection,
} from "./refund";

// Settings types
export type {
  Setting,
  SettingsByCategory,
  SettingsCategory,
  SettingsCategoryInfo,
  UpdateSettingRequest,
  UpdateSettingsBatchRequest,
  UpdateSettingsResponse,
  SettingFieldProps,
} from "./settings";

// Printing types
export type { PrintJob, PrinterConfig } from "./printing";

// Stock movement types
export type {
  MovementType,
  MovementReason,
  StockMovement,
  NewStockMovement,
  StockMovementFilter,
  StockMovementListResponse,
} from "./stock_movement";
