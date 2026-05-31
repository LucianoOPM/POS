use sea_orm::prelude::Decimal;
use serde::{Deserialize, Serialize};

// ============================================================================
// PARÁMETROS DE ENTRADA COMUNES
// ============================================================================

/// Tipo de agrupación temporal
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TimeGrouping {
    Day,
    Week,
    Month,
}

// ============================================================================
// 1. DASHBOARD EJECUTIVO DE VENTAS
// ============================================================================

/// Parámetros para el dashboard ejecutivo
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DashboardParams {
    pub date_from: String,
    pub date_to: String,
    pub shift_id: Option<i32>,
    pub user_id: Option<String>,
}

/// Resultado del dashboard ejecutivo
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DashboardResult {
    /// Ventas brutas (total de ventas sin descontar reembolsos)
    pub gross_sales: Decimal,
    /// Total reembolsado
    pub total_refunded: Decimal,
    /// Ventas netas (gross_sales - total_refunded)
    pub net_sales: Decimal,
    /// Número de ventas
    pub sales_count: i64,
    /// Ticket promedio (net_sales / sales_count)
    pub average_ticket: Decimal,
    /// Cantidad total de unidades vendidas
    pub total_products_sold: i64,
    /// Método de pago dominante
    pub dominant_payment_method: Option<String>,
    /// Monto del método de pago dominante
    pub dominant_payment_amount: Decimal,
    /// Producto más vendido
    pub top_product: Option<String>,
    /// Cantidad del producto más vendido
    pub top_product_quantity: i64,
}

// ============================================================================
// 2. REPORTE DE VENTAS EN EL TIEMPO
// ============================================================================

/// Parámetros para el reporte de ventas en el tiempo
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesOverTimeParams {
    pub date_from: String,
    pub date_to: String,
    pub grouping: TimeGrouping,
    pub shift_id: Option<i32>,
    pub user_id: Option<String>,
}

/// Item de ventas agrupado por período
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesOverTimeItem {
    /// Etiqueta del período (ej: "2024-01-15", "2024-W03", "2024-01")
    pub period: String,
    /// Ventas netas del período
    pub net_sales: Decimal,
    /// Número de ventas del período
    pub sales_count: i64,
    /// Ticket promedio del período
    pub average_ticket: Decimal,
}

/// Resultado del reporte de ventas en el tiempo
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesOverTimeResult {
    pub items: Vec<SalesOverTimeItem>,
    /// Totales del período completo
    pub total_net_sales: Decimal,
    pub total_sales_count: i64,
    pub total_average_ticket: Decimal,
}

// ============================================================================
// 3. REPORTE POR PRODUCTO
// ============================================================================

/// Parámetros para el reporte por producto
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductReportParams {
    pub date_from: String,
    pub date_to: String,
    pub product_id: Option<i32>,
    pub category_id: Option<i32>,
    pub shift_id: Option<i32>,
    pub user_id: Option<String>,
}

/// Item del reporte por producto
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductReportItem {
    pub product_id: i32,
    pub product_name: String,
    pub category_name: Option<String>,
    /// Cantidad vendida
    pub quantity_sold: i64,
    /// Cantidad reembolsada
    pub quantity_refunded: i64,
    /// Cantidad neta (vendida - reembolsada)
    pub net_quantity: i64,
    /// Ingreso bruto
    pub gross_revenue: Decimal,
    /// Ingreso neto (gross_revenue - refunded_amount)
    pub net_revenue: Decimal,
    /// Porcentaje de participación sobre el total
    pub share_percentage: Decimal,
}

/// Resultado del reporte por producto
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductReportResult {
    pub items: Vec<ProductReportItem>,
    /// Totales
    pub total_quantity_sold: i64,
    pub total_quantity_refunded: i64,
    pub total_net_quantity: i64,
    pub total_gross_revenue: Decimal,
    pub total_net_revenue: Decimal,
}

// ============================================================================
// 4. REPORTE POR CATEGORÍA
// ============================================================================

/// Parámetros para el reporte por categoría
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryReportParams {
    pub date_from: String,
    pub date_to: String,
    pub shift_id: Option<i32>,
    pub user_id: Option<String>,
}

/// Item del reporte por categoría
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryReportItem {
    pub category_id: Option<i32>,
    pub category_name: String,
    /// Ventas netas de la categoría
    pub net_sales: Decimal,
    /// Cantidad vendida
    pub quantity_sold: i64,
    /// Porcentaje del total
    pub share_percentage: Decimal,
}

/// Resultado del reporte por categoría
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryReportResult {
    pub items: Vec<CategoryReportItem>,
    /// Totales
    pub total_net_sales: Decimal,
    pub total_quantity_sold: i64,
}

// ============================================================================
// 5. REPORTE POR MÉTODO DE PAGO
// ============================================================================

/// Parámetros para el reporte por método de pago
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PaymentMethodReportParams {
    pub date_from: String,
    pub date_to: String,
    pub shift_id: Option<i32>,
    pub user_id: Option<String>,
}

/// Item del reporte por método de pago
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PaymentMethodReportItem {
    pub payment_method_id: i32,
    pub payment_method_name: String,
    /// Total cobrado por este método
    pub total_amount: Decimal,
    /// Número de transacciones
    pub transaction_count: i64,
    /// Porcentaje de participación
    pub share_percentage: Decimal,
}

/// Resultado del reporte por método de pago
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PaymentMethodReportResult {
    pub items: Vec<PaymentMethodReportItem>,
    /// Totales
    pub total_amount: Decimal,
    pub total_transactions: i64,
}

// ============================================================================
// 6. REPORTE DE REEMBOLSOS
// ============================================================================

/// Parámetros para el reporte de reembolsos
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RefundsReportParams {
    pub date_from: String,
    pub date_to: String,
    pub shift_id: Option<i32>,
    pub user_id: Option<String>,
}

/// Producto más reembolsado
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TopRefundedProduct {
    pub product_id: i32,
    pub product_name: String,
    pub quantity_refunded: i64,
    pub amount_refunded: Decimal,
}

/// Resultado del reporte de reembolsos
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RefundsReportResult {
    /// Total reembolsado
    pub total_refunded: Decimal,
    /// Número de reembolsos
    pub refunds_count: i64,
    /// Porcentaje sobre ventas brutas
    pub refund_percentage: Decimal,
    /// Ventas brutas del período (para contexto)
    pub gross_sales: Decimal,
    /// Productos más reembolsados (top 10)
    pub top_refunded_products: Vec<TopRefundedProduct>,
}

// ============================================================================
// 7. REPORTE DETALLADO DE VENTAS
// ============================================================================

/// Parámetros para el reporte detallado de ventas
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesReportParams {
    pub date_from: String,
    pub date_to: String,
}

/// Resumen agregado del período
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesReportSummary {
    pub gross_sales: Decimal,
    pub sales_count: i64,
    pub average_ticket: Decimal,
}

/// Ventas brutas agrupadas por día
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesByDayItem {
    pub date: String,
    pub gross_sales: Decimal,
    pub sales_count: i64,
}

/// Ventas brutas agrupadas por hora del día (0–23)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesByHourItem {
    pub hour: i32,
    pub gross_sales: Decimal,
    pub sales_count: i64,
}

/// Resultado del reporte detallado de ventas
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SalesReportResult {
    pub summary: SalesReportSummary,
    pub by_day: Vec<SalesByDayItem>,
    pub by_hour: Vec<SalesByHourItem>,
}

// ============================================================================
// 8. REPORTE POR TURNO
// ============================================================================

/// Parámetros para el reporte de turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftReportParams {
    pub shift_id: i32,
}

/// Metadata del turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftReportInfo {
    pub shift_id: i32,
    pub status: String,
    pub opening_balance: Decimal,
    /// ISO timestamp (UTC)
    pub opened_at: String,
    pub closed_at: Option<String>,
    /// Duración en minutos (solo si el turno está cerrado)
    pub duration_minutes: Option<i64>,
    /// Username del usuario que abrió el turno
    pub opened_by: String,
}

/// Resumen de ventas del turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftSalesSummary {
    pub gross_sales: Decimal,
    pub total_refunded: Decimal,
    pub net_sales: Decimal,
    pub sales_count: i64,
    pub average_ticket: Decimal,
    pub total_products_sold: i64,
}

/// Item de método de pago para el reporte de turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftPaymentMethodItem {
    pub payment_method_id: i32,
    pub payment_method_name: String,
    pub total_amount: Decimal,
    pub transaction_count: i64,
    pub share_percentage: Decimal,
}

/// Producto top del turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftTopProduct {
    pub product_id: i32,
    pub product_name: String,
    pub category_name: Option<String>,
    pub quantity_sold: i64,
    pub net_revenue: Decimal,
    pub share_percentage: Decimal,
}

/// Resumen de reembolsos del turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftRefundsSummary {
    pub total_refunded: Decimal,
    pub refunds_count: i64,
    /// Porcentaje sobre ventas brutas
    pub refund_percentage: Decimal,
}

/// Resultado completo del reporte de turno
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftReportResult {
    pub shift_info: ShiftReportInfo,
    pub sales_summary: ShiftSalesSummary,
    pub payment_methods: Vec<ShiftPaymentMethodItem>,
    pub top_products: Vec<ShiftTopProduct>,
    pub refunds_summary: ShiftRefundsSummary,
}
