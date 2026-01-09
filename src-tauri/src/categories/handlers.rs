use sea_orm::{
    ActiveModelTrait, ActiveValue, ColumnTrait, EntityTrait, QueryFilter, QueryOrder,
};

use super::structs::{Category, CategoryFilter, CategoryListReturn, NewCategory, UpdateCategory};
use crate::entities::{categories, prelude::Categories};
use crate::sessions::require_permission;
use crate::AppState;

const DB_ERROR: &str = "Error on DB connection";

/// Obtiene todas las categorías con filtros opcionales
#[tauri::command]
pub async fn get_all_categories(
    state: tauri::State<'_, AppState>,
    filters: CategoryFilter,
) -> Result<CategoryListReturn, String> {
    require_permission(&state, "categories.view")?;
    let db = &state.database;

    let mut query = Categories::find();

    // Filtrar por estado (activo/inactivo) si se especifica
    if let Some(status) = filters.status {
        query = query.filter(categories::Column::IsActive.eq(status));
    }

    // Filtrar por búsqueda en nombre si se especifica
    if let Some(search) = filters.search {
        query = query.filter(categories::Column::Name.contains(&search));
    }

    // Ordenar alfabéticamente
    query = query.order_by_asc(categories::Column::Name);

    let categories_list = query
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let total = categories_list.len() as u64;
    let categories = categories_list.into_iter().map(Category::from).collect();

    Ok(CategoryListReturn { categories, total })
}

/// Obtiene una categoría por ID
#[tauri::command]
pub async fn get_category_by_id(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<Category, String> {
    require_permission(&state, "categories.view")?;
    let db = &state.database;

    let category = Categories::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .ok_or("No se encontró la categoría".to_string())?;

    Ok(Category::from(category))
}

/// Crea una nueva categoría
#[tauri::command]
pub async fn create_category(
    state: tauri::State<'_, AppState>,
    category_data: NewCategory,
) -> Result<Category, String> {
    require_permission(&state, "categories.create")?;
    let db = &state.database;

    // Verifica unicidad del nombre
    let existing_category = Categories::find()
        .filter(categories::Column::Name.eq(&category_data.name))
        .one(db)
        .await
        .map_err(|_| "Error en la base de datos".to_string())?;

    if existing_category.is_some() {
        return Err("Ya existe una categoría con ese nombre".to_string());
    }

    // Inserta y retorna el modelo insertado directamente
    let inserted: categories::Model = Categories::insert(categories::ActiveModel::from(category_data))
        .exec_with_returning(db)
        .await
        .map_err(|_| "Error al insertar la categoría".to_string())?;

    Ok(Category::from(inserted))
}

/// Actualiza una categoría existente
#[tauri::command]
pub async fn update_category(
    state: tauri::State<'_, AppState>,
    id: i32,
    update_data: UpdateCategory,
) -> Result<Category, String> {
    require_permission(&state, "categories.edit")?;
    let db = &state.database;

    let db_category = Categories::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    if db_category.is_none() {
        return Err("No se encontró la categoría a modificar".to_string());
    }

    // Si se intenta actualizar el nombre, verificar que no exista
    if let Some(ref new_name) = update_data.name {
        let existing = Categories::find()
            .filter(categories::Column::Name.eq(new_name))
            .filter(categories::Column::Id.ne(id))
            .one(db)
            .await
            .map_err(|_| DB_ERROR)?;

        if existing.is_some() {
            return Err("Ya existe una categoría con ese nombre".to_string());
        }
    }

    let mut active_model = categories::ActiveModel::from(update_data);
    active_model.id = ActiveValue::Set(id);

    let updated = active_model
        .update(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(Category::from(updated))
}

/// Elimina una categoría (soft delete - marca como inactiva)
#[tauri::command]
pub async fn delete_category(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<Category, String> {
    require_permission(&state, "categories.delete")?;
    let db = &state.database;

    let category = Categories::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| "Error al consultar el ID de la categoría".to_string())?
        .ok_or("No se encontró la categoría seleccionada".to_string())?;

    // Soft delete: marcar como inactiva
    let mut active_model: categories::ActiveModel = category.clone().into();
    active_model.is_active = ActiveValue::Set(false);

    let updated = active_model
        .update(db)
        .await
        .map_err(|_| "Ocurrió un error al eliminar la categoría".to_string())?;

    Ok(Category::from(updated))
}

/// Elimina permanentemente una categoría (hard delete)
#[tauri::command]
pub async fn hard_delete_category(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<Category, String> {
    require_permission(&state, "categories.delete")?;
    let db = &state.database;

    let category = Categories::find_by_id(id)
        .one(db)
        .await
        .map_err(|_| "Error al consultar el ID de la categoría".to_string())?
        .ok_or("No se encontró la categoría seleccionada".to_string())?;

    categories::ActiveModel::from(category.clone())
        .delete(db)
        .await
        .map_err(|_| "Ocurrió un error al eliminar la categoría. Puede estar vinculada a productos.".to_string())?;

    Ok(Category::from(category))
}
