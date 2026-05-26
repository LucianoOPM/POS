use super::structs::{
    Setting, SettingsByCategory, UpdateSettingRequest, UpdateSettingsBatchRequest,
    UpdateSettingsResponse,
};
use crate::entities::{prelude::Settings, settings};
use crate::sessions::SessionHandler::require_permission;
use crate::AppState;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ActiveValue, ColumnTrait, EntityTrait, QueryFilter, QueryOrder};

const DB_ERROR: &str = "Error en la conexion a la base de datos";
const SETTING_NOT_FOUND: &str = "Configuracion no encontrada";

/// Get all settings grouped by category
#[tauri::command]
pub async fn get_settings(state: tauri::State<'_, AppState>) -> Result<SettingsByCategory, String> {
    require_permission(&state, "settings.view")?;
    let db = &state.database;

    let all_settings = Settings::find()
        .order_by_asc(settings::Column::Id)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let mut result = SettingsByCategory {
        erp: Vec::new(),
        business: Vec::new(),
        sales: Vec::new(),
        inventory: Vec::new(),
        receipt: Vec::new(),
    };

    for setting in all_settings {
        let setting_dto = Setting::from(setting.clone());
        match setting.category.as_str() {
            "erp" => result.erp.push(setting_dto),
            "business" => result.business.push(setting_dto),
            "sales" => result.sales.push(setting_dto),
            "inventory" => result.inventory.push(setting_dto),
            "receipt" => result.receipt.push(setting_dto),
            _ => {} // Ignore unknown categories
        }
    }

    Ok(result)
}

/// Get settings by category
#[tauri::command]
pub async fn get_settings_by_category(
    state: tauri::State<'_, AppState>,
    category: String,
) -> Result<Vec<Setting>, String> {
    require_permission(&state, "settings.view")?;
    let db = &state.database;

    let settings_list = Settings::find()
        .filter(settings::Column::Category.eq(&category))
        .order_by_asc(settings::Column::Id)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(settings_list.into_iter().map(Setting::from).collect())
}

/// Get a single setting by key
#[tauri::command]
pub async fn get_setting(
    state: tauri::State<'_, AppState>,
    key: String,
) -> Result<Setting, String> {
    require_permission(&state, "settings.view")?;
    let db = &state.database;

    let setting = Settings::find()
        .filter(settings::Column::Key.eq(&key))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .ok_or(SETTING_NOT_FOUND)?;

    Ok(Setting::from(setting))
}

/// Update a single setting
#[tauri::command]
pub async fn update_setting(
    state: tauri::State<'_, AppState>,
    data: UpdateSettingRequest,
) -> Result<Setting, String> {
    require_permission(&state, "settings.edit")?;
    let db = &state.database;

    // Find the setting
    let setting = Settings::find()
        .filter(settings::Column::Key.eq(&data.key))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .ok_or(SETTING_NOT_FOUND)?;

    // Update the setting
    let mut active_model: settings::ActiveModel = setting.into();
    active_model.value = ActiveValue::Set(data.value);
    active_model.updated_by = ActiveValue::Set(Some(data.updated_by));
    active_model.updated_at = ActiveValue::Set(Utc::now().into());

    let updated = active_model.update(db).await.map_err(|_| DB_ERROR)?;

    Ok(Setting::from(updated))
}

/// Update multiple settings at once (batch update)
#[tauri::command]
pub async fn update_settings_batch(
    state: tauri::State<'_, AppState>,
    data: UpdateSettingsBatchRequest,
) -> Result<UpdateSettingsResponse, String> {
    require_permission(&state, "settings.edit")?;
    let db = &state.database;

    let mut updated_settings = Vec::new();

    for update_request in data.settings {
        // Find the setting
        let setting = Settings::find()
            .filter(settings::Column::Key.eq(&update_request.key))
            .one(db)
            .await
            .map_err(|_| DB_ERROR)?;

        if let Some(setting) = setting {
            // Update the setting
            let mut active_model: settings::ActiveModel = setting.into();
            active_model.value = ActiveValue::Set(update_request.value);
            active_model.updated_by = ActiveValue::Set(Some(update_request.updated_by));
            active_model.updated_at = ActiveValue::Set(Utc::now().into());

            let updated = active_model.update(db).await.map_err(|_| DB_ERROR)?;
            updated_settings.push(Setting::from(updated));
        }
    }

    Ok(UpdateSettingsResponse {
        updated_count: updated_settings.len(),
        settings: updated_settings,
    })
}

/// Test ERP connection (placeholder for future implementation)
#[tauri::command]
pub async fn test_erp_connection(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    require_permission(&state, "settings.edit")?;

    // TODO: Implement actual ERP connection test
    // For now, return false as ERP is not yet implemented
    Ok(false)
}

/// Trigger manual ERP sync (placeholder for future implementation)
#[tauri::command]
pub async fn trigger_erp_sync(state: tauri::State<'_, AppState>) -> Result<String, String> {
    require_permission(&state, "settings.edit")?;

    // TODO: Implement actual ERP sync
    Err("Sincronizacion ERP no implementada aun".to_string())
}
