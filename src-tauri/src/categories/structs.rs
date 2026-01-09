use crate::entities::categories::{self, ActiveModel};
use sea_orm::ActiveValue::Set;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Category {
    pub id: i32,
    pub name: String,
    pub is_active: bool,
}

impl From<categories::Model> for Category {
    fn from(value: categories::Model) -> Self {
        Self {
            id: value.id,
            name: value.name,
            is_active: value.is_active,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewCategory {
    pub name: String,
}

impl From<NewCategory> for categories::ActiveModel {
    fn from(value: NewCategory) -> Self {
        ActiveModel {
            name: Set(value.name),
            ..Default::default()
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateCategory {
    pub name: Option<String>,
    pub is_active: Option<bool>,
}

impl From<UpdateCategory> for categories::ActiveModel {
    fn from(value: UpdateCategory) -> Self {
        let mut active_model = ActiveModel::default();

        if let Some(name) = value.name {
            active_model.name = Set(name);
        }
        if let Some(is_active) = value.is_active {
            active_model.is_active = Set(is_active);
        }

        active_model
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryFilter {
    pub status: Option<bool>, // None = todas, Some(true) = activas, Some(false) = inactivas
    pub search: Option<String>, // Búsqueda por nombre
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CategoryListReturn {
    pub categories: Vec<Category>,
    pub total: u64,
}
