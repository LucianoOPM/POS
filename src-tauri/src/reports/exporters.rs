use chrono::Local;
use rust_xlsxwriter::{Color, Format, FormatAlign, FormatBorder, Workbook};
use sea_orm::prelude::Decimal;
use std::path::PathBuf;

use super::structs::{
    CategoryReportResult, DashboardResult, PaymentMethodReportResult, ProductReportResult,
    RefundsReportResult, SalesOverTimeResult, SalesReportResult, ShiftReportResult,
    TimeGrouping,
};

// ============================================================================
// HELPERS PRIVADOS
// ============================================================================

fn dec_to_f64(d: &Decimal) -> f64 {
    d.to_string().parse::<f64>().unwrap_or(0.0)
}

fn get_export_path(report_name: &str) -> Result<PathBuf, String> {
    let timestamp = Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("{}_{}.xlsx", report_name, timestamp);
    let mut path = std::env::temp_dir();
    path.push("sales_point_exports");
    std::fs::create_dir_all(&path)
        .map_err(|e| format!("Error al crear directorio de exportación: {e}"))?;
    path.push(filename);
    Ok(path)
}

struct Formats {
    header: Format,
    info_label: Format,
    currency: Format,
    percent: Format,
    total_currency: Format,
    total_number: Format,
}

impl Formats {
    fn new() -> Self {
        Self {
            header: Format::new()
                .set_bold()
                .set_background_color(Color::RGB(0x1e40af))
                .set_font_color(Color::White)
                .set_align(FormatAlign::Center)
                .set_border(FormatBorder::Thin),
            info_label: Format::new().set_bold(),
            currency: Format::new().set_num_format("#,##0.00"),
            percent: Format::new().set_num_format("0.00"),
            total_currency: Format::new()
                .set_bold()
                .set_num_format("#,##0.00")
                .set_border_top(FormatBorder::Thin),
            total_number: Format::new()
                .set_bold()
                .set_border_top(FormatBorder::Thin),
        }
    }
}

/// Escribe el bloque de metadatos en las primeras 4 filas de la hoja
fn write_info_block(
    ws: &mut rust_xlsxwriter::Worksheet,
    fmt: &Formats,
    report_name: &str,
    period: &str,
    username: &str,
) -> Result<(), String> {
    ws.write_with_format(0, 0, "Reporte:", &fmt.info_label)
        .map_err(|e| e.to_string())?;
    ws.write(0, 1, report_name).map_err(|e| e.to_string())?;
    ws.write_with_format(1, 0, "Período:", &fmt.info_label)
        .map_err(|e| e.to_string())?;
    ws.write(1, 1, period).map_err(|e| e.to_string())?;
    ws.write_with_format(2, 0, "Generado:", &fmt.info_label)
        .map_err(|e| e.to_string())?;
    ws.write(2, 1, Local::now().format("%d/%m/%Y %H:%M").to_string())
        .map_err(|e| e.to_string())?;
    ws.write_with_format(3, 0, "Usuario:", &fmt.info_label)
        .map_err(|e| e.to_string())?;
    ws.write(3, 1, username).map_err(|e| e.to_string())?;
    Ok(())
}

fn write_headers(
    ws: &mut rust_xlsxwriter::Worksheet,
    fmt: &Formats,
    row: u32,
    headers: &[&str],
) -> Result<(), String> {
    for (col, &h) in headers.iter().enumerate() {
        ws.write_with_format(row, col as u16, h, &fmt.header)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ============================================================================
// 1. DASHBOARD EJECUTIVO
// ============================================================================

pub fn build_dashboard_xlsx(
    data: &DashboardResult,
    date_from: &str,
    date_to: &str,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("{} — {}", date_from, date_to);

    let ws = workbook.add_worksheet();
    ws.set_name("Dashboard").map_err(|e| e.to_string())?;
    write_info_block(ws, &fmt, "Dashboard Ejecutivo", &period, username)?;

    write_headers(ws, &fmt, 5, &["Métrica", "Valor"])?;

    let rows: &[(&str, f64)] = &[
        ("Ventas Brutas", dec_to_f64(&data.gross_sales)),
        ("Total Reembolsado", dec_to_f64(&data.total_refunded)),
        ("Ventas Netas", dec_to_f64(&data.net_sales)),
        ("Ticket Promedio", dec_to_f64(&data.average_ticket)),
        ("Dominant Pmt. Amount", dec_to_f64(&data.dominant_payment_amount)),
    ];
    for (i, (label, value)) in rows.iter().enumerate() {
        let row = 6 + i as u32;
        ws.write(row, 0, *label).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 1, *value, &fmt.currency)
            .map_err(|e| e.to_string())?;
    }

    // Campos de texto / enteros
    let row = 6 + rows.len() as u32;
    ws.write(row, 0, "Número de Ventas")
        .map_err(|e| e.to_string())?;
    ws.write(row, 1, data.sales_count).map_err(|e| e.to_string())?;

    let row = row + 1;
    ws.write(row, 0, "Productos Vendidos")
        .map_err(|e| e.to_string())?;
    ws.write(row, 1, data.total_products_sold)
        .map_err(|e| e.to_string())?;

    let row = row + 1;
    ws.write(row, 0, "Método de Pago Dominante")
        .map_err(|e| e.to_string())?;
    ws.write(
        row,
        1,
        data.dominant_payment_method
            .as_deref()
            .unwrap_or("Sin datos"),
    )
    .map_err(|e| e.to_string())?;

    let row = row + 1;
    ws.write(row, 0, "Producto Más Vendido")
        .map_err(|e| e.to_string())?;
    ws.write(row, 1, data.top_product.as_deref().unwrap_or("Sin datos"))
        .map_err(|e| e.to_string())?;

    let row = row + 1;
    ws.write(row, 0, "Cantidad del Top Producto")
        .map_err(|e| e.to_string())?;
    ws.write(row, 1, data.top_product_quantity)
        .map_err(|e| e.to_string())?;

    ws.autofit();

    save_workbook(workbook, "dashboard")
}

// ============================================================================
// 2. VENTAS EN EL TIEMPO
// ============================================================================

pub fn build_sales_over_time_xlsx(
    data: &SalesOverTimeResult,
    date_from: &str,
    date_to: &str,
    grouping: &TimeGrouping,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let grouping_label = match grouping {
        TimeGrouping::Day => "Día",
        TimeGrouping::Week => "Semana",
        TimeGrouping::Month => "Mes",
    };
    let period = format!("{} — {} (por {})", date_from, date_to, grouping_label);

    let ws = workbook.add_worksheet();
    ws.set_name("Ventas en el Tiempo")
        .map_err(|e| e.to_string())?;
    write_info_block(ws, &fmt, "Ventas en el Tiempo", &period, username)?;

    write_headers(ws, &fmt, 5, &["Período", "Ventas Netas", "Nº Ventas", "Ticket Promedio"])?;

    for (i, item) in data.items.iter().enumerate() {
        let row = 6 + i as u32;
        ws.write(row, 0, &item.period).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 1, dec_to_f64(&item.net_sales), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write(row, 2, item.sales_count).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 3, dec_to_f64(&item.average_ticket), &fmt.currency)
            .map_err(|e| e.to_string())?;
    }

    // Fila de totales
    let total_row = 6 + data.items.len() as u32;
    ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_number_with_format(total_row, 1, dec_to_f64(&data.total_net_sales), &fmt.total_currency)
        .map_err(|e| e.to_string())?;
    ws.write_with_format(total_row, 2, data.total_sales_count, &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_number_with_format(total_row, 3, dec_to_f64(&data.total_average_ticket), &fmt.total_currency)
        .map_err(|e| e.to_string())?;

    ws.autofit();

    save_workbook(workbook, "ventas_en_el_tiempo")
}

// ============================================================================
// 3. REPORTE DETALLADO DE VENTAS (3 hojas)
// ============================================================================

pub fn build_sales_report_xlsx(
    data: &SalesReportResult,
    date_from: &str,
    date_to: &str,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("{} — {}", date_from, date_to);

    // Hoja 1: Resumen
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Resumen").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Resumen de Ventas", &period, username)?;

        write_headers(ws, &fmt, 5, &["Métrica", "Valor"])?;

        ws.write(6, 0, "Ventas Brutas").map_err(|e| e.to_string())?;
        ws.write_number_with_format(6, 1, dec_to_f64(&data.summary.gross_sales), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write(7, 0, "Número de Ventas").map_err(|e| e.to_string())?;
        ws.write(7, 1, data.summary.sales_count).map_err(|e| e.to_string())?;
        ws.write(8, 0, "Ticket Promedio").map_err(|e| e.to_string())?;
        ws.write_number_with_format(8, 1, dec_to_f64(&data.summary.average_ticket), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.autofit();
    }

    // Hoja 2: Por Día
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Por Día").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Ventas por Día", &period, username)?;

        write_headers(ws, &fmt, 5, &["Fecha", "Ventas Brutas", "Nº Ventas"])?;

        let mut total_sales = 0.0f64;
        let mut total_count = 0i64;
        for (i, item) in data.by_day.iter().enumerate() {
            let row = 6 + i as u32;
            ws.write(row, 0, &item.date).map_err(|e| e.to_string())?;
            let v = dec_to_f64(&item.gross_sales);
            ws.write_number_with_format(row, 1, v, &fmt.currency)
                .map_err(|e| e.to_string())?;
            ws.write(row, 2, item.sales_count).map_err(|e| e.to_string())?;
            total_sales += v;
            total_count += item.sales_count;
        }

        let total_row = 6 + data.by_day.len() as u32;
        ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(total_row, 1, total_sales, &fmt.total_currency)
            .map_err(|e| e.to_string())?;
        ws.write_with_format(total_row, 2, total_count, &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.autofit();
    }

    // Hoja 3: Por Hora
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Por Hora").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Ventas por Hora", &period, username)?;

        write_headers(ws, &fmt, 5, &["Hora", "Ventas Brutas", "Nº Ventas"])?;

        let mut total_sales = 0.0f64;
        let mut total_count = 0i64;
        for (i, item) in data.by_hour.iter().enumerate() {
            let row = 6 + i as u32;
            ws.write(row, 0, format!("{:02}:00", item.hour))
                .map_err(|e| e.to_string())?;
            let v = dec_to_f64(&item.gross_sales);
            ws.write_number_with_format(row, 1, v, &fmt.currency)
                .map_err(|e| e.to_string())?;
            ws.write(row, 2, item.sales_count).map_err(|e| e.to_string())?;
            total_sales += v;
            total_count += item.sales_count;
        }

        let total_row = 6 + data.by_hour.len() as u32;
        ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(total_row, 1, total_sales, &fmt.total_currency)
            .map_err(|e| e.to_string())?;
        ws.write_with_format(total_row, 2, total_count, &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.autofit();
    }

    save_workbook(workbook, "ventas_detallado")
}

// ============================================================================
// 4. REPORTE POR PRODUCTO
// ============================================================================

pub fn build_product_report_xlsx(
    data: &ProductReportResult,
    date_from: &str,
    date_to: &str,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("{} — {}", date_from, date_to);

    let ws = workbook.add_worksheet();
    ws.set_name("Productos").map_err(|e| e.to_string())?;
    write_info_block(ws, &fmt, "Reporte por Producto", &period, username)?;

    write_headers(
        ws,
        &fmt,
        5,
        &[
            "Producto",
            "Categoría",
            "Cant. Vendida",
            "Cant. Reembolsada",
            "Cant. Neta",
            "Ingreso Bruto",
            "Ingreso Neto",
            "% Part.",
        ],
    )?;

    for (i, item) in data.items.iter().enumerate() {
        let row = 6 + i as u32;
        ws.write(row, 0, &item.product_name).map_err(|e| e.to_string())?;
        ws.write(row, 1, item.category_name.as_deref().unwrap_or("Sin categoría"))
            .map_err(|e| e.to_string())?;
        ws.write(row, 2, item.quantity_sold).map_err(|e| e.to_string())?;
        ws.write(row, 3, item.quantity_refunded).map_err(|e| e.to_string())?;
        ws.write(row, 4, item.net_quantity).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 5, dec_to_f64(&item.gross_revenue), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 6, dec_to_f64(&item.net_revenue), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 7, dec_to_f64(&item.share_percentage), &fmt.percent)
            .map_err(|e| e.to_string())?;
    }

    // Totales
    let total_row = 6 + data.items.len() as u32;
    ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_with_format(total_row, 2, data.total_quantity_sold, &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_with_format(total_row, 3, data.total_quantity_refunded, &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_with_format(total_row, 4, data.total_net_quantity, &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_number_with_format(total_row, 5, dec_to_f64(&data.total_gross_revenue), &fmt.total_currency)
        .map_err(|e| e.to_string())?;
    ws.write_number_with_format(total_row, 6, dec_to_f64(&data.total_net_revenue), &fmt.total_currency)
        .map_err(|e| e.to_string())?;

    ws.autofit();

    save_workbook(workbook, "reporte_productos")
}

// ============================================================================
// 5. REPORTE POR CATEGORÍA
// ============================================================================

pub fn build_category_report_xlsx(
    data: &CategoryReportResult,
    date_from: &str,
    date_to: &str,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("{} — {}", date_from, date_to);

    let ws = workbook.add_worksheet();
    ws.set_name("Categorías").map_err(|e| e.to_string())?;
    write_info_block(ws, &fmt, "Reporte por Categoría", &period, username)?;

    write_headers(ws, &fmt, 5, &["Categoría", "Ventas Netas", "Cantidad", "% Part."])?;

    for (i, item) in data.items.iter().enumerate() {
        let row = 6 + i as u32;
        ws.write(row, 0, &item.category_name).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 1, dec_to_f64(&item.net_sales), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write(row, 2, item.quantity_sold).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 3, dec_to_f64(&item.share_percentage), &fmt.percent)
            .map_err(|e| e.to_string())?;
    }

    // Totales
    let total_row = 6 + data.items.len() as u32;
    ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_number_with_format(total_row, 1, dec_to_f64(&data.total_net_sales), &fmt.total_currency)
        .map_err(|e| e.to_string())?;
    ws.write_with_format(total_row, 2, data.total_quantity_sold, &fmt.total_number)
        .map_err(|e| e.to_string())?;

    ws.autofit();

    save_workbook(workbook, "reporte_categorias")
}

// ============================================================================
// 6. REPORTE POR MÉTODO DE PAGO
// ============================================================================

pub fn build_payment_method_report_xlsx(
    data: &PaymentMethodReportResult,
    date_from: &str,
    date_to: &str,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("{} — {}", date_from, date_to);

    let ws = workbook.add_worksheet();
    ws.set_name("Métodos de Pago")
        .map_err(|e| e.to_string())?;
    write_info_block(ws, &fmt, "Métodos de Pago", &period, username)?;

    write_headers(ws, &fmt, 5, &["Método", "Total", "Transacciones", "% Part."])?;

    for (i, item) in data.items.iter().enumerate() {
        let row = 6 + i as u32;
        ws.write(row, 0, &item.payment_method_name)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 1, dec_to_f64(&item.total_amount), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write(row, 2, item.transaction_count).map_err(|e| e.to_string())?;
        ws.write_number_with_format(row, 3, dec_to_f64(&item.share_percentage), &fmt.percent)
            .map_err(|e| e.to_string())?;
    }

    // Totales
    let total_row = 6 + data.items.len() as u32;
    ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
        .map_err(|e| e.to_string())?;
    ws.write_number_with_format(total_row, 1, dec_to_f64(&data.total_amount), &fmt.total_currency)
        .map_err(|e| e.to_string())?;
    ws.write_with_format(total_row, 2, data.total_transactions, &fmt.total_number)
        .map_err(|e| e.to_string())?;

    ws.autofit();

    save_workbook(workbook, "reporte_metodos_pago")
}

// ============================================================================
// 7. REPORTE DE REEMBOLSOS (2 hojas)
// ============================================================================

pub fn build_refunds_report_xlsx(
    data: &RefundsReportResult,
    date_from: &str,
    date_to: &str,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("{} — {}", date_from, date_to);

    // Hoja 1: Resumen
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Resumen").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Reporte de Reembolsos", &period, username)?;

        write_headers(ws, &fmt, 5, &["Métrica", "Valor"])?;

        ws.write(6, 0, "Total Reembolsado").map_err(|e| e.to_string())?;
        ws.write_number_with_format(6, 1, dec_to_f64(&data.total_refunded), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.write(7, 0, "Número de Reembolsos").map_err(|e| e.to_string())?;
        ws.write(7, 1, data.refunds_count).map_err(|e| e.to_string())?;
        ws.write(8, 0, "% sobre Ventas Brutas").map_err(|e| e.to_string())?;
        ws.write_number_with_format(8, 1, dec_to_f64(&data.refund_percentage), &fmt.percent)
            .map_err(|e| e.to_string())?;
        ws.write(9, 0, "Ventas Brutas del Período").map_err(|e| e.to_string())?;
        ws.write_number_with_format(9, 1, dec_to_f64(&data.gross_sales), &fmt.currency)
            .map_err(|e| e.to_string())?;
        ws.autofit();
    }

    // Hoja 2: Top Productos Reembolsados
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Top Productos").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Productos Más Reembolsados", &period, username)?;

        write_headers(
            ws,
            &fmt,
            5,
            &["Producto", "Cantidad Reembolsada", "Monto Reembolsado"],
        )?;

        let mut total_qty = 0i64;
        let mut total_amount = 0.0f64;
        for (i, item) in data.top_refunded_products.iter().enumerate() {
            let row = 6 + i as u32;
            ws.write(row, 0, &item.product_name).map_err(|e| e.to_string())?;
            ws.write(row, 1, item.quantity_refunded).map_err(|e| e.to_string())?;
            let v = dec_to_f64(&item.amount_refunded);
            ws.write_number_with_format(row, 2, v, &fmt.currency)
                .map_err(|e| e.to_string())?;
            total_qty += item.quantity_refunded;
            total_amount += v;
        }

        let total_row = 6 + data.top_refunded_products.len() as u32;
        ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_with_format(total_row, 1, total_qty, &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(total_row, 2, total_amount, &fmt.total_currency)
            .map_err(|e| e.to_string())?;
        ws.autofit();
    }

    save_workbook(workbook, "reporte_reembolsos")
}

// ============================================================================
// 8. REPORTE POR TURNO (3 hojas)
// ============================================================================

pub fn build_shift_report_xlsx(
    data: &ShiftReportResult,
    username: &str,
) -> Result<String, String> {
    let mut workbook = Workbook::new();
    let fmt = Formats::new();
    let period = format!("Turno #{}", data.shift_info.shift_id);

    // Hoja 1: Info del Turno + KPIs
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Info Turno").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Reporte de Turno", &period, username)?;

        write_headers(ws, &fmt, 5, &["Campo", "Valor"])?;

        let info = &data.shift_info;
        let summary = &data.sales_summary;
        let rows: &[(&str, String)] = &[
            ("Turno ID", info.shift_id.to_string()),
            ("Estado", info.status.clone()),
            ("Abierto por", info.opened_by.clone()),
            ("Apertura", info.opened_at.clone()),
            (
                "Cierre",
                info.closed_at.as_deref().unwrap_or("En curso").to_string(),
            ),
            (
                "Duración (min)",
                info.duration_minutes
                    .map(|m| m.to_string())
                    .unwrap_or_else(|| "En curso".to_string()),
            ),
        ];
        for (i, (label, value)) in rows.iter().enumerate() {
            let row = 6 + i as u32;
            ws.write(row, 0, *label).map_err(|e| e.to_string())?;
            ws.write(row, 1, value.as_str()).map_err(|e| e.to_string())?;
        }

        // Bloque de KPIs
        let offset = 6 + rows.len() as u32 + 1;
        write_headers(ws, &fmt, offset, &["Métrica de Ventas", "Valor"])?;

        let kpi_rows: &[(&str, f64)] = &[
            ("Ventas Brutas", dec_to_f64(&summary.gross_sales)),
            ("Total Reembolsado", dec_to_f64(&summary.total_refunded)),
            ("Ventas Netas", dec_to_f64(&summary.net_sales)),
            ("Ticket Promedio", dec_to_f64(&summary.average_ticket)),
        ];
        for (i, (label, value)) in kpi_rows.iter().enumerate() {
            let row = offset + 1 + i as u32;
            ws.write(row, 0, *label).map_err(|e| e.to_string())?;
            ws.write_number_with_format(row, 1, *value, &fmt.currency)
                .map_err(|e| e.to_string())?;
        }
        let row = offset + 1 + kpi_rows.len() as u32;
        ws.write(row, 0, "Número de Ventas").map_err(|e| e.to_string())?;
        ws.write(row, 1, summary.sales_count).map_err(|e| e.to_string())?;
        let row = row + 1;
        ws.write(row, 0, "Productos Vendidos").map_err(|e| e.to_string())?;
        ws.write(row, 1, summary.total_products_sold).map_err(|e| e.to_string())?;

        ws.autofit();
    }

    // Hoja 2: Métodos de Pago
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Métodos de Pago").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Métodos de Pago del Turno", &period, username)?;

        write_headers(ws, &fmt, 5, &["Método", "Total", "Transacciones", "% Part."])?;

        let mut total_amount = 0.0f64;
        let mut total_tx = 0i64;
        for (i, pm) in data.payment_methods.iter().enumerate() {
            let row = 6 + i as u32;
            ws.write(row, 0, &pm.payment_method_name)
                .map_err(|e| e.to_string())?;
            let v = dec_to_f64(&pm.total_amount);
            ws.write_number_with_format(row, 1, v, &fmt.currency)
                .map_err(|e| e.to_string())?;
            ws.write(row, 2, pm.transaction_count).map_err(|e| e.to_string())?;
            ws.write_number_with_format(row, 3, dec_to_f64(&pm.share_percentage), &fmt.percent)
                .map_err(|e| e.to_string())?;
            total_amount += v;
            total_tx += pm.transaction_count;
        }

        let total_row = 6 + data.payment_methods.len() as u32;
        ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(total_row, 1, total_amount, &fmt.total_currency)
            .map_err(|e| e.to_string())?;
        ws.write_with_format(total_row, 2, total_tx, &fmt.total_number)
            .map_err(|e| e.to_string())?;

        ws.autofit();
    }

    // Hoja 3: Top Productos
    {
        let ws = workbook.add_worksheet();
        ws.set_name("Top Productos").map_err(|e| e.to_string())?;
        write_info_block(ws, &fmt, "Top Productos del Turno", &period, username)?;

        write_headers(
            ws,
            &fmt,
            5,
            &[
                "Producto",
                "Categoría",
                "Cant. Vendida",
                "Ingresos Netos",
                "% Part.",
            ],
        )?;

        let mut total_qty = 0i64;
        let mut total_revenue = 0.0f64;
        for (i, p) in data.top_products.iter().enumerate() {
            let row = 6 + i as u32;
            ws.write(row, 0, &p.product_name).map_err(|e| e.to_string())?;
            ws.write(row, 1, p.category_name.as_deref().unwrap_or("Sin categoría"))
                .map_err(|e| e.to_string())?;
            ws.write(row, 2, p.quantity_sold).map_err(|e| e.to_string())?;
            let v = dec_to_f64(&p.net_revenue);
            ws.write_number_with_format(row, 3, v, &fmt.currency)
                .map_err(|e| e.to_string())?;
            ws.write_number_with_format(row, 4, dec_to_f64(&p.share_percentage), &fmt.percent)
                .map_err(|e| e.to_string())?;
            total_qty += p.quantity_sold;
            total_revenue += v;
        }

        let total_row = 6 + data.top_products.len() as u32;
        ws.write_with_format(total_row, 0, "TOTAL", &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_with_format(total_row, 2, total_qty, &fmt.total_number)
            .map_err(|e| e.to_string())?;
        ws.write_number_with_format(total_row, 3, total_revenue, &fmt.total_currency)
            .map_err(|e| e.to_string())?;

        ws.autofit();
    }

    save_workbook(workbook, "reporte_turno")
}

// ============================================================================
// HELPER: guardar workbook y retornar path
// ============================================================================

fn save_workbook(mut workbook: Workbook, report_name: &str) -> Result<String, String> {
    let path = get_export_path(report_name)?;
    let buf = workbook
        .save_to_buffer()
        .map_err(|e| format!("Error al generar el archivo Excel: {e}"))?;
    std::fs::write(&path, buf)
        .map_err(|e| format!("Error al guardar el archivo: {e}"))?;
    Ok(path.to_string_lossy().to_string())
}
