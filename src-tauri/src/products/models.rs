use crate::entities::products::{self, ActiveModel};
use sea_orm::{prelude::Decimal, ActiveValue::Set};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Product {
    pub id_product: i32,
    pub name: String,
    pub stock: i32,
    pub max_stock: i32,
    pub is_active: bool,
    pub unit_price: Decimal,
    pub bar_code: String,
    pub description: String,
}

impl From<products::Model> for Product {
    fn from(value: products::Model) -> Self {
        Self {
            id_product: value.id_product,
            name: value.name,
            stock: value.stock,
            max_stock: value.max_stock,
            is_active: value.is_active,
            unit_price: value.unit_price,
            bar_code: value.bar_code,
            description: value.description,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewProduct {
    pub name: String,
    pub stock: i32,
    pub max_stock: i32,
    pub is_active: bool,
    pub unit_price: Decimal,
    pub bar_code: String,
    pub description: String,
}

impl From<NewProduct> for products::ActiveModel {
    fn from(value: NewProduct) -> Self {
        ActiveModel {
            name: Set(value.name),
            stock: Set(value.stock),
            is_active: Set(value.is_active),
            unit_price: Set(value.unit_price),
            bar_code: Set(value.bar_code),
            description: Set(value.description),
            max_stock: Set(value.max_stock),
            ..Default::default()
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateProduct {
    pub name: Option<String>,
    pub stock: Option<i32>,
    pub is_active: Option<bool>,
    pub unit_price: Option<Decimal>,
    pub bar_code: Option<String>,
    pub description: Option<String>,
    pub max_stock: Option<i32>,
}

impl From<UpdateProduct> for products::ActiveModel {
    fn from(value: UpdateProduct) -> Self {
        let mut active_model = ActiveModel::default();
        if let Some(name) = value.name {
            active_model.name = Set(name);
        }
        if let Some(stock) = value.stock {
            active_model.stock = Set(stock);
        }
        if let Some(is_active) = value.is_active {
            active_model.is_active = Set(is_active);
        }
        if let Some(unit_price) = value.unit_price {
            active_model.unit_price = Set(unit_price);
        }
        if let Some(bar_code) = value.bar_code {
            active_model.bar_code = Set(bar_code);
        }
        if let Some(max_stock) = value.max_stock {
            active_model.max_stock = Set(max_stock)
        }
        if let Some(description) = value.description {
            active_model.description = Set(description);
        }
        active_model
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductFilter {
    pub status: bool,
    pub page: u64,
    pub limit: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ProductPagesInfo {
    pub total_pages: u64,
    pub total_items: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductListReturn {
    pub products: Vec<Product>,
    pub total_pages: u64,
    pub total_items: u64,
}
