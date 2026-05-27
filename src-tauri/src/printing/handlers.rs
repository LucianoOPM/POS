use crate::{
    entities::{
        prelude::{PaymentMethods, Products, SaleDetails, SalePayments, Sales, TicketPrints},
        sale_details, sale_payments, ticket_prints,
    },
    sessions::SessionHandler::require_permission,
    AppState,
};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect,
};

use super::structs::{PrintJob, PrintStatus, PrinterConfig, ReceiptContent, ReceiptItem};

const DB_ERROR: &str = "Error en la base de datos";

#[tauri::command]
pub async fn print_receipt(
    state: tauri::State<'_, AppState>,
    sale_id: String,
) -> Result<PrintJob, String> {
    let session = require_permission(&state, "settings.view")?;
    let db = &state.database;

    // Detect reprint: ¿ya existe un registro para esta venta?
    let is_reprint = TicketPrints::find()
        .filter(ticket_prints::Column::SaleId.eq(&sale_id))
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .is_some();

    let business_name = {
        let ps = state.print_service.lock().await;
        ps.get_config().business_name.clone()
    };

    let content =
        fetch_receipt_content(db, &sale_id, &session.username, &business_name, is_reprint).await?;

    let job = {
        let mut ps = state.print_service.lock().await;
        ps.print_receipt(content, session.user_id.clone()).await?
    };

    // Persistir en DB
    let status_str = match job.status {
        PrintStatus::Completed => "completed",
        PrintStatus::Failed => "failed",
    };

    ticket_prints::ActiveModel {
        id: Set(job.id.clone()),
        sale_id: Set(job.sale_id.clone()),
        printed_by: Set(session.user_id.clone()),
        adapter: Set(job.adapter.clone()),
        reprint: Set(job.reprint),
        status: Set(status_str.to_string()),
        error_msg: Set(job.error.clone()),
        preview_text: Set(job.preview_text.clone()),
        printed_at: Set(chrono::Utc::now().fixed_offset()),
    }
    .insert(db)
    .await
    .map_err(|_| "Error al guardar el registro de impresión".to_string())?;

    Ok(job)
}

#[tauri::command]
pub async fn preview_receipt(
    state: tauri::State<'_, AppState>,
    sale_id: String,
) -> Result<String, String> {
    let session = require_permission(&state, "settings.view")?;

    let business_name = {
        let ps = state.print_service.lock().await;
        ps.get_config().business_name.clone()
    };

    let content = fetch_receipt_content(
        &state.database,
        &sale_id,
        &session.username,
        &business_name,
        false,
    )
    .await?;

    let ps = state.print_service.lock().await;
    Ok(ps.preview_receipt(content))
}

#[tauri::command]
pub async fn get_print_jobs(state: tauri::State<'_, AppState>) -> Result<Vec<PrintJob>, String> {
    require_permission(&state, "settings.view")?;

    let records: Vec<crate::entities::ticket_prints::Model> = TicketPrints::find()
        .order_by_desc(ticket_prints::Column::PrintedAt)
        .limit(100)
        .all(&state.database)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    Ok(records.into_iter().map(PrintJob::from).collect())
}

#[tauri::command]
pub async fn configure_printer(
    state: tauri::State<'_, AppState>,
    config: PrinterConfig,
) -> Result<PrinterConfig, String> {
    require_permission(&state, "settings.edit")?;
    let mut ps = state.print_service.lock().await;
    ps.set_config(config);
    Ok(ps.get_config().clone())
}

#[tauri::command]
pub async fn get_printer_config(
    state: tauri::State<'_, AppState>,
) -> Result<PrinterConfig, String> {
    require_permission(&state, "settings.view")?;
    let ps = state.print_service.lock().await;
    Ok(ps.get_config().clone())
}

async fn fetch_receipt_content(
    db: &sea_orm::DatabaseConnection,
    sale_id: &str,
    cashier: &str,
    business_name: &str,
    reprint: bool,
) -> Result<ReceiptContent, String> {
    let sale = Sales::find_by_id(sale_id.to_string())
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or_else(|| "Venta no encontrada".to_string())?;

    let details = SaleDetails::find()
        .filter(sale_details::Column::SaleId.eq(sale_id))
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let mut items: Vec<ReceiptItem> = Vec::new();
    for detail in &details {
        let product = Products::find_by_id(detail.product_id)
            .one(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;

        let name = product
            .map(|p| p.name)
            .unwrap_or_else(|| format!("Producto {}", detail.product_id));

        items.push(ReceiptItem {
            name,
            quantity: detail.quantity,
            unit_price: format!("${:.2}", detail.unit_price),
            line_total: format!("${:.2}", detail.total),
        });
    }

    let payment = SalePayments::find()
        .filter(sale_payments::Column::SaleId.eq(sale_id))
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let payment_method = if let Some(p) = payment {
        PaymentMethods::find_by_id(p.payment_method_id)
            .one(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?
            .map(|m| m.name)
            .unwrap_or_else(|| "Desconocido".to_string())
    } else {
        "No especificado".to_string()
    };

    let tax = sale.total - sale.subtotal;
    let date = sale.created_at.format("%Y-%m-%d %H:%M").to_string();

    Ok(ReceiptContent {
        business_name: business_name.to_string(),
        sale_id: sale.id,
        cashier: cashier.to_string(),
        date,
        items,
        subtotal: format!("${:.2}", sale.subtotal),
        tax: format!("${:.2}", tax),
        total: format!("${:.2}", sale.total),
        payment_method,
        reprint,
    })
}
