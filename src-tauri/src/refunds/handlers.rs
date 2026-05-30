use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, ExprTrait, PaginatorTrait,
    QueryFilter, QueryOrder, QuerySelect, TransactionTrait,
};

use super::structs::{
    CreateRefundResponse, NewRefund, Refund, RefundDetail, RefundFilter, RefundListReturn,
    RefundWithDetails, RecentSale, SaleForRefund, SaleItemForRefund,
};
use crate::entities::{
    refund_details, refunds, sale_details,
    prelude::{Products, RefundDetails, Refunds, SaleDetails, Sales, Users},
};
use crate::sessions::require_permission;
use crate::AppState;
use sea_orm::prelude::Decimal;

const DB_ERROR: &str = "Error en la conexión a la base de datos";
const PERMISSION_SALES_REFUND: &str = "sales.refund";

/// Get paginated list of refunds with filters
#[tauri::command]
pub async fn get_refunds(
    state: tauri::State<'_, AppState>,
    filters: RefundFilter,
) -> Result<RefundListReturn, String> {
    require_permission(&state, PERMISSION_SALES_REFUND)?;
    let db = &state.database;

    let mut query = Refunds::find();

    // Apply filters
    if let Some(ref date_from) = filters.date_from {
        if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(date_from, "%Y-%m-%d") {
            let datetime = parsed_date
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_local_timezone(chrono::FixedOffset::west_opt(0).unwrap())
                .unwrap();
            query = query.filter(refunds::Column::CreatedAt.gte(datetime));
        }
    }

    if let Some(ref date_to) = filters.date_to {
        if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(date_to, "%Y-%m-%d") {
            let datetime = parsed_date
                .and_hms_opt(23, 59, 59)
                .unwrap()
                .and_local_timezone(chrono::FixedOffset::west_opt(0).unwrap())
                .unwrap();
            query = query.filter(refunds::Column::CreatedAt.lte(datetime));
        }
    }

    if let Some(min_amount) = filters.min_amount {
        query = query.filter(refunds::Column::Amount.gte(min_amount));
    }

    if let Some(max_amount) = filters.max_amount {
        query = query.filter(refunds::Column::Amount.lte(max_amount));
    }

    if let Some(ref search) = filters.search {
        query = query.filter(
            refunds::Column::Reason
                .contains(search)
                .or(refunds::Column::SaleId.contains(search)),
        );
    }

    if let Some(ref created_by) = filters.created_by {
        query = query.filter(refunds::Column::CreatedBy.eq(created_by));
    }

    // Order by most recent first
    query = query.order_by_desc(refunds::Column::CreatedAt);

    // Get total count before pagination
    let total_items = query
        .clone()
        .count(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    // Calculate pagination
    let total_pages = (total_items as f64 / filters.limit as f64).ceil() as u64;

    // Apply pagination
    let refunds_list = query
        .offset((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    // Enrich with related data
    let mut enriched_refunds = Vec::new();
    for refund in refunds_list {
        // Get username of creator
        let creator = Users::find_by_id(&refund.created_by)
            .one(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;
        let created_by_username = creator.map(|u| u.username);

        // Get sale total
        let sale = Sales::find_by_id(&refund.sale_id)
            .one(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;
        let sale_total = sale.map(|s| s.total);

        // Get items count
        let items_count = RefundDetails::find()
            .filter(refund_details::Column::RefundId.eq(refund.id))
            .count(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;

        enriched_refunds.push(Refund::from_with_relations(
            refund,
            created_by_username,
            sale_total,
            Some(items_count as i64),
        ));
    }

    Ok(RefundListReturn {
        refunds: enriched_refunds,
        total_pages,
        total_items,
    })
}

/// Get a single refund by ID with all its details
#[tauri::command]
pub async fn get_refund_by_id(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<RefundWithDetails, String> {
    require_permission(&state, PERMISSION_SALES_REFUND)?;
    let db = &state.database;

    // Get refund
    let refund = Refunds::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or("Reembolso no encontrado".to_string())?;

    // Get creator username
    let creator = Users::find_by_id(&refund.created_by)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;
    let created_by_username = creator.map(|u| u.username);

    // Get sale total
    let sale = Sales::find_by_id(&refund.sale_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;
    let sale_total = sale.map(|s| s.total);

    // Get refund details with product info
    let details = RefundDetails::find()
        .filter(refund_details::Column::RefundId.eq(id))
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let mut enriched_details = Vec::new();
    for detail in details {
        let product = Products::find_by_id(detail.product_id)
            .one(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;

        enriched_details.push(RefundDetail {
            id: detail.id,
            refund_id: detail.refund_id,
            product_id: detail.product_id,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            product_name: product.as_ref().map(|p| p.name.clone()),
            product_code: product.map(|p| p.code),
        });
    }

    let items_count = enriched_details.len() as i64;

    Ok(RefundWithDetails {
        refund: Refund::from_with_relations(refund, created_by_username, sale_total, Some(items_count)),
        details: enriched_details,
    })
}

/// Create a new refund with its details
#[tauri::command]
pub async fn create_refund(
    state: tauri::State<'_, AppState>,
    refund_data: NewRefund,
) -> Result<CreateRefundResponse, String> {
    let session = require_permission(&state, PERMISSION_SALES_REFUND)?;
    let db = &state.database;

    // Validate sale exists and is active
    let sale = Sales::find_by_id(&refund_data.sale_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or("La venta especificada no existe".to_string())?;

    if !sale.status {
        return Err("No se puede reembolsar una venta cancelada".to_string());
    }

    // Validate items not empty
    if refund_data.items.is_empty() {
        return Err("El reembolso debe incluir al menos un producto".to_string());
    }

    // Validate reason is not empty
    if refund_data.reason.trim().is_empty() {
        return Err("Debe especificar un motivo para el reembolso".to_string());
    }

    // Begin transaction
    let txn = db
        .begin()
        .await
        .map_err(|_| "Error al iniciar transacción".to_string())?;

    // Calculate total refund amount and validate products
    let mut total_amount = Decimal::ZERO;

    for item in &refund_data.items {
        // Validate product exists
        let product = Products::find_by_id(item.product_id)
            .one(&txn)
            .await
            .map_err(|_| format!("Error al consultar producto {}", item.product_id))?
            .ok_or(format!("Producto {} no encontrado", item.product_id))?;

        if item.quantity <= 0 {
            return Err(format!(
                "La cantidad para el producto '{}' debe ser positiva",
                product.name
            ));
        }

        // Calculate item total
        let item_total = item.unit_price * Decimal::from(item.quantity);
        total_amount += item_total;
    }

    // Validate refund amount doesn't exceed sale total
    if total_amount > sale.total {
        return Err(format!(
            "El monto del reembolso (${:.2}) excede el total de la venta (${:.2})",
            total_amount, sale.total
        ));
    }

    // Create refund record
    let refund_model = refund_data.to_active_model(total_amount, session.user_id.clone());

    let inserted_refund = refund_model
        .insert(&txn)
        .await
        .map_err(|e| format!("Error al crear reembolso: {:?}", e))?;

    // Create refund details and restore stock
    for item in &refund_data.items {
        // Insert refund detail
        let detail = refund_details::ActiveModel {
            refund_id: Set(inserted_refund.id),
            product_id: Set(item.product_id),
            quantity: Set(item.quantity),
            unit_price: Set(item.unit_price),
            ..Default::default()
        };

        detail
            .insert(&txn)
            .await
            .map_err(|e| format!("Error al registrar detalle de reembolso: {:?}", e))?;

        // Restaurar stock mediante el servicio centralizado de inventario
        let product = Products::find_by_id(item.product_id)
            .one(&txn)
            .await
            .map_err(|_| "Error al actualizar stock".to_string())?
            .ok_or("Producto no encontrado al actualizar stock".to_string())?;

        let previous_stock = product.stock;
        let new_stock = previous_stock + item.quantity;

        crate::inventory::service::record_stock_change(
            &txn,
            item.product_id,
            "refund",
            item.quantity,
            previous_stock,
            new_stock,
            "customer_refund",
            None,
            &session.user_id,
        )
        .await?;
    }

    // Commit transaction
    txn.commit()
        .await
        .map_err(|_| "Error al confirmar la transacción".to_string())?;

    Ok(CreateRefundResponse {
        id: inserted_refund.id,
        sale_id: inserted_refund.sale_id,
        amount: inserted_refund.amount,
        reason: inserted_refund.reason,
        created_at: inserted_refund.created_at.to_string(),
        items_count: refund_data.items.len(),
    })
}

/// Delete a refund (and reverse stock changes)
#[tauri::command]
pub async fn delete_refund(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<Refund, String> {
    let session = require_permission(&state, PERMISSION_SALES_REFUND)?;
    let db = &state.database;

    // Find the refund
    let refund = Refunds::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or("Reembolso no encontrado".to_string())?;

    // Begin transaction
    let txn = db
        .begin()
        .await
        .map_err(|_| "Error al iniciar transacción".to_string())?;

    // Get refund details to reverse stock
    let details = RefundDetails::find()
        .filter(refund_details::Column::RefundId.eq(id))
        .all(&txn)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    // Reverse stock changes (reduce stock since refund is being cancelled)
    for detail in &details {
        let product = Products::find_by_id(detail.product_id)
            .one(&txn)
            .await
            .map_err(|_| "Error al consultar producto".to_string())?
            .ok_or("Producto no encontrado".to_string())?;

        // Check if we have enough stock to reverse
        if product.stock < detail.quantity {
            return Err(format!(
                "No se puede eliminar el reembolso: el producto '{}' no tiene suficiente stock ({}) para revertir la cantidad reembolsada ({})",
                product.name, product.stock, detail.quantity
            ));
        }

        let previous_stock = product.stock;
        let new_stock = previous_stock - detail.quantity;

        crate::inventory::service::record_stock_change(
            &txn,
            detail.product_id,
            "exit",
            detail.quantity,
            previous_stock,
            new_stock,
            "sale_adjustment",
            None,
            &session.user_id,
        )
        .await?;
    }

    // Delete refund details (cascade should handle this, but being explicit)
    RefundDetails::delete_many()
        .filter(refund_details::Column::RefundId.eq(id))
        .exec(&txn)
        .await
        .map_err(|_| "Error al eliminar detalles del reembolso".to_string())?;

    // Delete refund
    let refund_to_delete: refunds::ActiveModel = refund.clone().into();
    refund_to_delete
        .delete(&txn)
        .await
        .map_err(|_| "Error al eliminar el reembolso".to_string())?;

    // Commit transaction
    txn.commit()
        .await
        .map_err(|_| "Error al confirmar la transacción".to_string())?;

    Ok(Refund::from(refund))
}

/// Get recent sales from the last week for refund selection dropdown
#[tauri::command]
pub async fn get_recent_sales_for_refund(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<RecentSale>, String> {
    require_permission(&state, PERMISSION_SALES_REFUND)?;
    let db = &state.database;

    // Calculate date 7 days ago
    let week_ago = chrono::Utc::now() - chrono::Duration::days(7);

    // Get active sales from last week
    let sales = Sales::find()
        .filter(crate::entities::sales::Column::Status.eq(true))
        .filter(crate::entities::sales::Column::CreatedAt.gte(week_ago))
        .order_by_desc(crate::entities::sales::Column::CreatedAt)
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let mut recent_sales = Vec::new();

    for sale in sales {
        // Count items in this sale
        let items_count = SaleDetails::find()
            .filter(sale_details::Column::SaleId.eq(&sale.id))
            .count(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;

        // Get total refunded amount for this sale
        let refunds_for_sale = Refunds::find()
            .filter(refunds::Column::SaleId.eq(&sale.id))
            .all(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?;

        let refunded_amount: Decimal = refunds_for_sale.iter().map(|r| r.amount).sum();
        let has_refunds = !refunds_for_sale.is_empty();

        // Only include sales that still have refundable amount
        if refunded_amount < sale.total {
            recent_sales.push(RecentSale {
                id: sale.id,
                total: sale.total,
                created_at: sale.created_at.to_string(),
                items_count: items_count as i64,
                has_refunds,
                refunded_amount,
            });
        }
    }

    Ok(recent_sales)
}

/// Get sale details for refund form (includes products and refundable quantities)
#[tauri::command]
pub async fn get_sale_for_refund(
    state: tauri::State<'_, AppState>,
    sale_id: String,
) -> Result<SaleForRefund, String> {
    require_permission(&state, PERMISSION_SALES_REFUND)?;
    let db = &state.database;

    // Get the sale
    let sale = Sales::find_by_id(&sale_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or("Venta no encontrada".to_string())?;

    if !sale.status {
        return Err("No se puede reembolsar una venta cancelada".to_string());
    }

    // Get sale details with product info
    let sale_items = SaleDetails::find()
        .filter(sale_details::Column::SaleId.eq(&sale_id))
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    // Get all refunds for this sale to calculate already refunded quantities
    let existing_refunds = Refunds::find()
        .filter(refunds::Column::SaleId.eq(&sale_id))
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let refund_ids: Vec<i32> = existing_refunds.iter().map(|r| r.id).collect();
    let total_refunded: Decimal = existing_refunds.iter().map(|r| r.amount).sum();

    // Get all refund details for these refunds
    let refund_details_list = if !refund_ids.is_empty() {
        RefundDetails::find()
            .filter(refund_details::Column::RefundId.is_in(refund_ids))
            .all(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?
    } else {
        Vec::new()
    };

    // Build items with refundable quantities
    let mut items = Vec::new();

    for item in sale_items {
        // Get product info
        let product = Products::find_by_id(item.product_id)
            .one(db)
            .await
            .map_err(|_| DB_ERROR.to_string())?
            .ok_or(format!("Producto {} no encontrado", item.product_id))?;

        // Calculate already refunded quantity for this product
        let already_refunded: i32 = refund_details_list
            .iter()
            .filter(|rd| rd.product_id == item.product_id)
            .map(|rd| rd.quantity)
            .sum();

        let refundable_quantity = item.quantity - already_refunded;

        items.push(SaleItemForRefund {
            id: item.id,
            product_id: item.product_id,
            product_name: product.name,
            product_code: product.code,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            tax_rate: item.tax_rate,
            tax_amount: item.tax_amount,
            total: item.total,
            already_refunded,
            refundable_quantity,
        });
    }

    let refundable_amount = sale.total - total_refunded;

    Ok(SaleForRefund {
        id: sale.id,
        subtotal: sale.subtotal,
        total: sale.total,
        status: sale.status,
        created_at: sale.created_at.to_string(),
        items,
        total_refunded,
        refundable_amount,
    })
}
