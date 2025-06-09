use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter,
    QueryOrder,
};

use super::models::{NewProduct, Product, ProductFilter, ProductListReturn, UpdateProduct};
use crate::entities::{prelude::Products, products};
use crate::AppState;

const DB_ERROR: &str = "Error on DB connection";

/// Obtiene una página de productos filtrados por estado (activo/inactivo).
#[tauri::command]
pub async fn get_products(
    state: tauri::State<'_, AppState>,
    filters: ProductFilter,
) -> Result<ProductListReturn, String> {
    let db = &state.database;

    let paginator = Products::find()
        .filter(products::Column::IsActive.eq(filters.status))
        .order_by_asc(products::Column::IdProduct)
        .paginate(db, filters.limit);

    let (total_pages, total_items, products_page) = tokio::try_join!(
        paginator.num_pages(),
        paginator.num_items(),
        paginator.fetch_page(filters.page - 1)
    )
    .map_err(|_| DB_ERROR)?;

    let products = products_page.into_iter().map(Product::from).collect();

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
    let db = &state.database;

    // Verifica unicidad del código de barras
    let product_barcode = Products::find()
        .filter(products::Column::BarCode.eq(&product_data.bar_code))
        .one(db)
        .await
        .map_err(|_| "Error en la base de datos".to_string())?;

    if product_barcode.is_some() {
        return Err("El código de barras registrado ya existe".to_string());
    }

    // Inserta y retorna el modelo insertado directamente
    let inserted: products::Model = Products::insert(products::ActiveModel::from(product_data))
        .exec_with_returning(db)
        .await
        .map_err(|_| "Error al insertar el producto".to_string())?;

    Ok(Product::from(inserted))
}

#[tauri::command]
pub async fn update_product(
    state: tauri::State<'_, AppState>,
    id_product: i32,
    update_data: UpdateProduct,
) -> Result<Product, String> {
    let db = &state.database;

    let db_product = Products::find_by_id(id_product)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    if db_product.is_none() {
        return Err("No se encontró producto a modificar".to_string());
    }

    let mut active_model = products::ActiveModel::from(update_data);
    active_model.id_product = ActiveValue::Set(id_product);

    let updated = Products::update(active_model)
        .exec(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(Product::from(updated))
}

#[tauri::command]
pub async fn delete_product(
    state: tauri::State<'_, AppState>,
    id_product: i32,
) -> Result<Product, String> {
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
