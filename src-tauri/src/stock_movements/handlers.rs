use sea_orm::{
    ColumnTrait, Condition, EntityTrait,
    PaginatorTrait, QueryFilter, QueryOrder, QuerySelect, TransactionTrait,
};

use super::structs::{
    NewStockMovement, StockMovement, StockMovementFilter, StockMovementListReturn,
};
use crate::entities::{
    prelude::{Products, StockMovements, Users},
    products, stock_movements,
};
use crate::sessions::require_permission;
use crate::AppState;

const DB_ERROR: &str = "Error en la conexión a la base de datos";

const VALID_TYPES: &[&str] = &["entry", "exit", "adjustment"];
const VALID_REASONS: &[&str] = &[
    "purchase",
    "loss",
    "damaged",
    "return",
    "manual_adjustment",
    "supplier_return",
    "sale_adjustment",
    "customer_refund",
    "other",
];

#[tauri::command]
pub async fn create_stock_movement(
    state: tauri::State<'_, AppState>,
    movement_data: NewStockMovement,
) -> Result<StockMovement, String> {
    let session = require_permission(&state, "products.create")?;
    let db = &state.database;

    if !VALID_TYPES.contains(&movement_data.movement_type.as_str()) {
        return Err(format!(
            "Tipo de movimiento inválido: {}. Use: entry, exit, adjustment",
            movement_data.movement_type
        ));
    }

    if !VALID_REASONS.contains(&movement_data.reason.as_str()) {
        return Err(format!("Motivo inválido: {}", movement_data.reason));
    }

    if movement_data.quantity <= 0 {
        return Err("La cantidad debe ser mayor a cero".to_string());
    }

    let product = Products::find_by_id(movement_data.product_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or("Producto no encontrado".to_string())?;

    let previous_stock = product.stock;
    let new_stock = match movement_data.movement_type.as_str() {
        "entry" => previous_stock + movement_data.quantity,
        "exit" => {
            let result = previous_stock - movement_data.quantity;
            if result < 0 {
                return Err(format!(
                    "Stock insuficiente. Stock actual: {}, cantidad solicitada: {}",
                    previous_stock, movement_data.quantity
                ));
            }
            result
        }
        "adjustment" => previous_stock + movement_data.quantity,
        _ => unreachable!(),
    };

    let txn = db
        .begin()
        .await
        .map_err(|_| "Error al iniciar transacción".to_string())?;

    let inserted = crate::inventory::service::record_stock_change(
        &txn,
        movement_data.product_id,
        &movement_data.movement_type,
        movement_data.quantity,
        previous_stock,
        new_stock,
        &movement_data.reason,
        movement_data.notes.clone(),
        &session.user_id,
    )
    .await?;

    txn.commit()
        .await
        .map_err(|_| "Error al confirmar la transacción".to_string())?;

    let product_name = Products::find_by_id(inserted.product_id)
        .one(db)
        .await
        .ok()
        .flatten()
        .map(|p| p.name);

    let username = Users::find_by_id(&inserted.created_by)
        .one(db)
        .await
        .ok()
        .flatten()
        .map(|u| u.username);

    Ok(StockMovement {
        id: inserted.id,
        product_id: inserted.product_id,
        product_name,
        movement_type: inserted.movement_type,
        quantity: inserted.quantity,
        previous_stock: inserted.previous_stock,
        new_stock: inserted.new_stock,
        reason: inserted.reason,
        notes: inserted.notes,
        created_by: inserted.created_by,
        created_by_username: username,
        created_at: inserted.created_at.to_string(),
    })
}

#[tauri::command]
pub async fn get_stock_movements(
    state: tauri::State<'_, AppState>,
    filters: StockMovementFilter,
) -> Result<StockMovementListReturn, String> {
    require_permission(&state, "products.view")?;
    let db = &state.database;

    let mut query = StockMovements::find();

    if let Some(product_id) = filters.product_id {
        query = query.filter(stock_movements::Column::ProductId.eq(product_id));
    }

    if let Some(ref movement_type) = filters.movement_type {
        if !movement_type.is_empty() {
            query = query.filter(stock_movements::Column::MovementType.eq(movement_type));
        }
    }

    if let Some(ref date_from) = filters.date_from {
        if let Ok(parsed) = chrono::NaiveDate::parse_from_str(date_from, "%Y-%m-%d") {
            let datetime = parsed
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_local_timezone(chrono::FixedOffset::west_opt(0).unwrap())
                .unwrap();
            query = query.filter(stock_movements::Column::CreatedAt.gte(datetime));
        }
    }

    if let Some(ref date_to) = filters.date_to {
        if let Ok(parsed) = chrono::NaiveDate::parse_from_str(date_to, "%Y-%m-%d") {
            let datetime = parsed
                .and_hms_opt(23, 59, 59)
                .unwrap()
                .and_local_timezone(chrono::FixedOffset::west_opt(0).unwrap())
                .unwrap();
            query = query.filter(stock_movements::Column::CreatedAt.lte(datetime));
        }
    }

    if let Some(ref search) = filters.search {
        if !search.is_empty() {
            let matching_ids: Vec<i32> = Products::find()
                .filter(products::Column::Name.contains(search))
                .all(db)
                .await
                .map_err(|_| DB_ERROR.to_string())?
                .into_iter()
                .map(|p| p.id)
                .collect();

            query = query.filter(
                Condition::any()
                    .add(stock_movements::Column::MovementType.contains(search))
                    .add(stock_movements::Column::Reason.contains(search))
                    .add(stock_movements::Column::ProductId.is_in(matching_ids)),
            );
        }
    }

    query = query.order_by_desc(stock_movements::Column::CreatedAt);

    let total_items = query
        .clone()
        .count(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let total_pages = (total_items as f64 / filters.limit as f64).ceil() as u64;

    let movements_list = query
        .offset((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let mut movements = Vec::new();
    for m in movements_list {
        let product_name = Products::find_by_id(m.product_id)
            .one(db)
            .await
            .ok()
            .flatten()
            .map(|p| p.name);

        let username = Users::find_by_id(&m.created_by)
            .one(db)
            .await
            .ok()
            .flatten()
            .map(|u| u.username);

        movements.push(StockMovement {
            id: m.id,
            product_id: m.product_id,
            product_name,
            movement_type: m.movement_type,
            quantity: m.quantity,
            previous_stock: m.previous_stock,
            new_stock: m.new_stock,
            reason: m.reason,
            notes: m.notes,
            created_by: m.created_by,
            created_by_username: username,
            created_at: m.created_at.to_string(),
        });
    }

    Ok(StockMovementListReturn {
        movements,
        total_pages,
        total_items,
    })
}

#[tauri::command]
pub async fn get_product_movements(
    state: tauri::State<'_, AppState>,
    product_id: i32,
) -> Result<Vec<StockMovement>, String> {
    require_permission(&state, "products.view")?;
    let db = &state.database;

    Products::find_by_id(product_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?
        .ok_or("Producto no encontrado".to_string())?;

    let movements_list = StockMovements::find()
        .filter(stock_movements::Column::ProductId.eq(product_id))
        .order_by_desc(stock_movements::Column::CreatedAt)
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let product_name = Products::find_by_id(product_id)
        .one(db)
        .await
        .ok()
        .flatten()
        .map(|p| p.name);

    let mut movements = Vec::new();
    for m in movements_list {
        let username = Users::find_by_id(&m.created_by)
            .one(db)
            .await
            .ok()
            .flatten()
            .map(|u| u.username);

        movements.push(StockMovement {
            id: m.id,
            product_id: m.product_id,
            product_name: product_name.clone(),
            movement_type: m.movement_type,
            quantity: m.quantity,
            previous_stock: m.previous_stock,
            new_stock: m.new_stock,
            reason: m.reason,
            notes: m.notes,
            created_by: m.created_by,
            created_by_username: username,
            created_at: m.created_at.to_string(),
        });
    }

    Ok(movements)
}
