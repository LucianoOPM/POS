import { invoke } from "@tauri-apps/api/core";
import type { LucideIcon } from "lucide-preact";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  FolderTree,
  CreditCard,
  RotateCcw,
} from "lucide-preact";

// ============================================================================
// TIPOS COMUNES
// ============================================================================

export type TimeGrouping = "day" | "week" | "month";

// ============================================================================
// 1. DASHBOARD EJECUTIVO
// ============================================================================

export interface DashboardParams {
  date_from: string;
  date_to: string;
}

export interface DashboardResult {
  gross_sales: string;
  total_refunded: string;
  net_sales: string;
  sales_count: number;
  average_ticket: string;
  dominant_payment_method: string | null;
  dominant_payment_amount: string;
  top_product: string | null;
  top_product_quantity: number;
}

// ============================================================================
// 2. VENTAS EN EL TIEMPO
// ============================================================================

export interface SalesOverTimeParams {
  date_from: string;
  date_to: string;
  grouping: TimeGrouping;
}

export interface SalesOverTimeItem {
  period: string;
  net_sales: string;
  sales_count: number;
  average_ticket: string;
}

export interface SalesOverTimeResult {
  items: SalesOverTimeItem[];
  total_net_sales: string;
  total_sales_count: number;
  total_average_ticket: string;
}

// ============================================================================
// 3. REPORTE POR PRODUCTO
// ============================================================================

export interface ProductReportParams {
  date_from: string;
  date_to: string;
  product_id?: number;
  category_id?: number;
}

export interface ProductReportItem {
  product_id: number;
  product_name: string;
  category_name: string | null;
  quantity_sold: number;
  quantity_refunded: number;
  net_quantity: number;
  gross_revenue: string;
  net_revenue: string;
  share_percentage: string;
}

export interface ProductReportResult {
  items: ProductReportItem[];
  total_quantity_sold: number;
  total_quantity_refunded: number;
  total_net_quantity: number;
  total_gross_revenue: string;
  total_net_revenue: string;
}

// ============================================================================
// 4. REPORTE POR CATEGORIA
// ============================================================================

export interface CategoryReportParams {
  date_from: string;
  date_to: string;
}

export interface CategoryReportItem {
  category_id: number | null;
  category_name: string;
  net_sales: string;
  quantity_sold: number;
  share_percentage: string;
}

export interface CategoryReportResult {
  items: CategoryReportItem[];
  total_net_sales: string;
  total_quantity_sold: number;
}

// ============================================================================
// 5. REPORTE POR METODO DE PAGO
// ============================================================================

export interface PaymentMethodReportParams {
  date_from: string;
  date_to: string;
}

export interface PaymentMethodReportItem {
  payment_method_id: number;
  payment_method_name: string;
  total_amount: string;
  transaction_count: number;
  share_percentage: string;
}

export interface PaymentMethodReportResult {
  items: PaymentMethodReportItem[];
  total_amount: string;
  total_transactions: number;
}

// ============================================================================
// 6. REPORTE DE REEMBOLSOS
// ============================================================================

export interface RefundsReportParams {
  date_from: string;
  date_to: string;
}

export interface TopRefundedProduct {
  product_id: number;
  product_name: string;
  quantity_refunded: number;
  amount_refunded: string;
}

export interface RefundsReportResult {
  total_refunded: string;
  refunds_count: number;
  refund_percentage: string;
  gross_sales: string;
  top_refunded_products: TopRefundedProduct[];
}

// ============================================================================
// CATALOGO DE REPORTES DISPONIBLES
// ============================================================================

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const availableReports: ReportDefinition[] = [
  {
    id: "dashboard",
    name: "Dashboard Ejecutivo",
    description: "Vista resumida del estado del negocio con ventas, reembolsos y ticket promedio",
    icon: LayoutDashboard,
    color: "#3b82f6",
  },
  {
    id: "sales-over-time",
    name: "Ventas en el Tiempo",
    description: "Tendencias y estacionalidad de ventas agrupadas por día, semana o mes",
    icon: TrendingUp,
    color: "#10b981",
  },
  {
    id: "products",
    name: "Reporte por Producto",
    description: "Detalle de productos vendidos, reembolsados y su participación en ingresos",
    icon: Package,
    color: "#6366f1",
  },
  {
    id: "categories",
    name: "Reporte por Categoría",
    description: "Análisis de desempeño por línea de producto con ventas y porcentajes",
    icon: FolderTree,
    color: "#f59e0b",
  },
  {
    id: "payment-methods",
    name: "Métodos de Pago",
    description: "Conciliación financiera y distribución de pagos por método",
    icon: CreditCard,
    color: "#22c55e",
  },
  {
    id: "refunds",
    name: "Reporte de Reembolsos",
    description: "Análisis de devoluciones, productos más reembolsados y tendencias",
    icon: RotateCcw,
    color: "#ef4444",
  },
];

// ============================================================================
// ACCIONES DE REPORTES (LLAMADAS AL BACKEND)
// ============================================================================

export const reportsActions = {
  /**
   * Obtiene el dashboard ejecutivo de ventas
   */
  getDashboard: async (params: DashboardParams): Promise<DashboardResult> => {
    return await invoke<DashboardResult>("get_dashboard_report", { params });
  },

  /**
   * Obtiene el reporte de ventas en el tiempo
   */
  getSalesOverTime: async (params: SalesOverTimeParams): Promise<SalesOverTimeResult> => {
    return await invoke<SalesOverTimeResult>("get_sales_over_time_report", { params });
  },

  /**
   * Obtiene el reporte por producto
   */
  getProductReport: async (params: ProductReportParams): Promise<ProductReportResult> => {
    return await invoke<ProductReportResult>("get_product_report", { params });
  },

  /**
   * Obtiene el reporte por categoria
   */
  getCategoryReport: async (params: CategoryReportParams): Promise<CategoryReportResult> => {
    return await invoke<CategoryReportResult>("get_category_report", { params });
  },

  /**
   * Obtiene el reporte por metodo de pago
   */
  getPaymentMethodReport: async (params: PaymentMethodReportParams): Promise<PaymentMethodReportResult> => {
    return await invoke<PaymentMethodReportResult>("get_payment_method_report", { params });
  },

  /**
   * Obtiene el reporte de reembolsos
   */
  getRefundsReport: async (params: RefundsReportParams): Promise<RefundsReportResult> => {
    return await invoke<RefundsReportResult>("get_refunds_report", { params });
  },

  /**
   * Obtiene la lista de reportes disponibles
   */
  getAvailableReports: (): ReportDefinition[] => {
    return availableReports;
  },

  /**
   * Obtiene un reporte por su ID
   */
  getReportById: (id: string): ReportDefinition | undefined => {
    return availableReports.find((r) => r.id === id);
  },
};
