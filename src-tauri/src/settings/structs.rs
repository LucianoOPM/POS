use crate::entities::settings;
use serde::{Deserialize, Serialize};

/// Individual setting record for API responses
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Setting {
    pub id: i32,
    pub key: String,
    pub value: String,
    pub category: String,
    pub value_type: String,
    pub label: String,
    pub description: Option<String>,
    pub is_sensitive: bool,
    pub updated_at: String,
    pub updated_by: Option<String>,
}

impl From<settings::Model> for Setting {
    fn from(model: settings::Model) -> Self {
        Self {
            id: model.id,
            key: model.key,
            // Mask sensitive values
            value: if model.is_sensitive && !model.value.is_empty() {
                "********".to_string()
            } else {
                model.value
            },
            category: model.category,
            value_type: model.value_type,
            label: model.label,
            description: model.description,
            is_sensitive: model.is_sensitive,
            updated_at: model.updated_at.to_string(),
            updated_by: model.updated_by,
        }
    }
}

/// Settings grouped by category
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SettingsByCategory {
    pub erp: Vec<Setting>,
    pub business: Vec<Setting>,
    pub sales: Vec<Setting>,
    pub inventory: Vec<Setting>,
    pub receipt: Vec<Setting>,
}

/// Request to update a single setting
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateSettingRequest {
    pub key: String,
    pub value: String,
    pub updated_by: String,
}

/// Request to update multiple settings at once
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateSettingsBatchRequest {
    pub settings: Vec<UpdateSettingRequest>,
}

/// Response after updating settings
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateSettingsResponse {
    pub updated_count: usize,
    pub settings: Vec<Setting>,
}
