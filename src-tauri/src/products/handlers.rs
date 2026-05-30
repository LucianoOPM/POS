use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, Condition, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, QuerySelect, TransactionTrait,
};
use sea_orm::sea_query::Expr;
use sea_orm::ExprTrait;

use super::structs::{LowStockProduct, NewProduct, Product, ProductFilter, ProductListReturn, UpdateProduct};
use crate::entities::{categories::Entity as Categories, prelude::Products, products, settings};
use crate::sessions::require_permission;
use crate::AppState;

const DB_ERROR: &str = "Error on DB connection";

/// Obtiene una página de productos filtrados por estado (activo/inactivo).
#[tauri::command]
pub async fn get_products(
    state: tauri::State<'_, AppState>,
    filters: ProductFilter,
) -> Result<ProductListReturn, String> {
    require_permission(&state, "products.view")?;
    let db = &state.database;

    // Contar total de items para paginación
    let total_items = Products::find()
        .filter(products::Column::IsActive.eq(filters.status))
        .count(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let total_pages = (total_items as f64 / filters.limit as f64).ceil() as u64;

    // Query con JOIN para obtener categorías
    let offset = (filters.page - 1) * filters.limit;
    let products_with_categories = Products::find()
        .find_also_related(Categories)
        .filter(products::Column::IsActive.eq(filters.status))
        .order_by_asc(products::Column::Id)
        .offset(offset)
        .limit(filters.limit)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let products = products_with_categories
        .into_iter()
        .map(|(product, category)| Product::from_with_category(product, category))
        .collect();

    Ok(ProductListReturn {
        products,
        total_pages,
        total_items,
    })
}

#[tauri::command]
pub async fn create_product(
    state: tauri::State<'_, AppState>,
    product_data: NewProduct,
) -> Result<Product, String> {
    let session = require_permission(&state, "products.create")?;
    let db = &state.database;
    let initial_stock = product_data.stock;

    // Verifica unicidad del código de barras (fuera de transacción, solo lectura)
    let product_barcode = Products::find()
        .filter(products::Column::Code.eq(&product_data.code))
        .one(db)
        .await
        .map_err(|_| "Error en la base de datos".to_string())?;

    if product_barcode.is_some() {
        return Err("El código de barras registrado ya existe".to_string());
    }

    let txn = db
        .begin()
        .await
        .map_err(|_| "Error al iniciar transacción".to_string())?;

    let inserted: products::Model = Products::insert(products::ActiveModel::from(product_data))
        .exec_with_returning(&txn)
        .await
        .map_err(|e| format!("Error al insertar el producto: {:?}", e))?;

    // Si el producto nace con stock, registrar el movimiento de entrada inicial
    if initial_stock > 0 {
        crate::inventory::service::record_stock_change(
            &txn,
            inserted.id,
            "entry",
            initial_stock,
            0,
            initial_stock,
            "purchase",
            None,
            &session.user_id,
        )
        .await?;
    }

    txn.commit()
        .await
        .map_err(|_| "Error al confirmar transacción".to_string())?;

    Ok(Product::from(inserted))
}

#[tauri::command]
pub async fn update_product(
    state: tauri::State<'_, AppState>,
    id_product: i32,
    update_data: UpdateProduct,
) -> Result<Product, String> {
    require_permission(&state, "products.edit")?;
    let db = &state.database;

    let db_product = Products::find_by_id(id_product)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    if db_product.is_none() {
        return Err("No se encontró producto a modificar".to_string());
    }

    let mut active_model = products::ActiveModel::from(update_data);
    active_model.id = ActiveValue::Set(id_product);

    let updated = active_model.update(db).await.map_err(|_| DB_ERROR)?;

    Ok(Product::from(updated))
}

#[tauri::command]
pub async fn delete_product(
    state: tauri::State<'_, AppState>,
    id_product: i32,
) -> Result<Product, String> {
    require_permission(&state, "products.delete")?;
    let db = &state.database;

    let product = Products::find_by_id(id_product)
        .one(db)
        .await
        .map_err(|_| "Error al consultar el ID del producto".to_string())?
        .ok_or("No se encontró el producto seleccionado".to_string())?;

    products::ActiveModel::from(product.clone())
        .delete(db)
        .await
        .map_err(|_| "Ocurrió un error al eliminar el producto".to_string())?;

    Ok(Product::from(product))
}

#[tauri::command]
pub async fn check_low_stock(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<LowStockProduct>, String> {
    require_permission(&state, "products.view")?;
    let db = &state.database;

    let inventory_settings = settings::Entity::find()
        .filter(
            Condition::any()
                .add(settings::Column::Key.eq("inventory.low_stock_alerts"))
                .add(settings::Column::Key.eq("inventory.low_stock_threshold")),
        )
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let alerts_enabled = inventory_settings
        .iter()
        .find(|s| s.key == "inventory.low_stock_alerts")
        .map(|s| s.value != "false")
        .unwrap_or(true);

    if !alerts_enabled {
        return Ok(vec![]);
    }

    let global_threshold: i32 = inventory_settings
        .iter()
        .find(|s| s.key == "inventory.low_stock_threshold")
        .and_then(|s| s.value.parse::<i32>().ok())
        .unwrap_or(10);

    let low_stock_products = Products::find()
        .filter(products::Column::IsActive.eq(true))
        .filter(
            Condition::any()
                .add(
                    Condition::all()
                        .add(products::Column::MinStock.is_not_null())
                        .add(
                            Expr::col(products::Column::Stock)
                                .lte(Expr::col(products::Column::MinStock)),
                        ),
                )
                .add(
                    Condition::all()
                        .add(products::Column::MinStock.is_null())
                        .add(products::Column::Stock.lte(global_threshold)),
                ),
        )
        .order_by_asc(products::Column::Stock)
        .all(db)
        .await
        .map_err(|_| DB_ERROR.to_string())?;

    let result = low_stock_products
        .into_iter()
        .map(|p| {
            let threshold = p.min_stock.unwrap_or(global_threshold);
            LowStockProduct {
                id: p.id,
                name: p.name,
                stock: Ord::max(p.stock, 0) as u32,
                threshold: Ord::max(threshold, 0) as u32,
            }
        })
        .collect();

    Ok(result)
}
