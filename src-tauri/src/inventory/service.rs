use sea_orm::{ActiveModelTrait, ActiveValue::Set, ConnectionTrait, EntityTrait};

use crate::entities::{prelude::Products, products, stock_movements};

/// Actualiza `products.stock` e inserta un registro en `stock_movements` de forma atómica.
/// Siempre debe invocarse dentro de una transacción existente del llamador.
/// Retorna el modelo del movimiento insertado.
pub async fn record_stock_change<C: ConnectionTrait>(
    db: &C,
    product_id: i32,
    movement_type: &str,
    quantity: i32,
    previous_stock: i32,
    new_stock: i32,
    reason: &str,
    notes: Option<String>,
    created_by: &str,
) -> Result<stock_movements::Model, String> {
    let product = Products::find_by_id(product_id)
        .one(db)
        .await
        .map_err(|_| "Error al leer producto para actualizar stock".to_string())?
        .ok_or("Producto no encontrado al actualizar stock".to_string())?;

    let mut active: products::ActiveModel = product.into();
    active.stock = Set(new_stock);
    active.updated_by = Set(created_by.to_string());
    active
        .update(db)
        .await
        .map_err(|_| "Error al actualizar stock del producto".to_string())?;

    let movement = stock_movements::ActiveModel {
        product_id: Set(product_id),
        movement_type: Set(movement_type.to_string()),
        quantity: Set(quantity),
        previous_stock: Set(previous_stock),
        new_stock: Set(new_stock),
        reason: Set(reason.to_string()),
        notes: Set(notes),
        created_by: Set(created_by.to_string()),
        ..Default::default()
    }
    .insert(db)
    .await
    .map_err(|e| format!("Error al registrar movimiento de inventario: {:?}", e))?;

    Ok(movement)
}
