/**
 * Tipos para la vista de Reportes
 */

// Rango de fechas para filtros
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Tipos de reporte (tabs)
export type ReportType = "sales" | "products" | "financial";

// Formato de exportacion
export type ExportFormat = "pdf" | "excel";

// Resumen de ventas
export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageTicket: number;
  salesByPaymentMethod: PaymentMethodSales[];
}

export interface PaymentMethodSales {
  method: string;
  count: number;
  total: number;
}

// Registro individual de venta
export interface SaleRecord {
  id: number;
  date: string;
  time: string;
  ticketNumber: string;
  items: number;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashier: string;
}

// Movimiento de producto
export interface ProductMovement {
  id: number;
  code: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

// Resumen de movimiento de productos
export interface ProductMovementSummary {
  topProducts: ProductMovement[];
  lowProducts: ProductMovement[];
  totalUnitsSold: number;
  totalCategories: number;
}

// Resumen financiero
export interface FinancialSummary {
  grossRevenue: number;
  netRevenue: number;
  totalCosts: number;
  grossProfit: number;
  profitMargin: number;
  taxCollected: number;
}

// Registro financiero diario
export interface DailyFinancial {
  date: string;
  revenue: number;
  costs: number;
  profit: number;
}

// Filtros de reporte
export interface ReportFilters {
  dateRange: DateRange;
  paymentMethods?: string[];
  categories?: string[];
}

// Props para componentes de reportes
export interface ReportsStatsProps {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageTicket: number;
}

export interface ReportsToolbarProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExport: (format: ExportFormat) => void;
}

export interface ReportsTabsProps {
  activeTab: ReportType;
  onTabChange: (tab: ReportType) => void;
}
