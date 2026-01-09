use crate::entities::{categories, products::{self, ActiveModel}};
use sea_orm::{prelude::Decimal, ActiveValue::Set};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub category_id: Option<i32>,
    pub category_name: Option<String>,
    pub code: String,
    pub stock: i32,
    pub is_active: bool,
    pub price: Decimal,
    pub cost: Decimal,
    pub tax: Decimal,
}

impl Product {
    pub fn from_with_category(
        product: products::Model,
        category: Option<categories::Model>,
    ) -> Self {
        Self {
            id: product.id,
            name: product.name,
            category_id: product.category_id,
            category_name: category.map(|c| c.name),
            code: product.code,
            stock: product.stock,
            is_active: product.is_active,
            price: product.price,
            cost: product.cost,
            tax: product.tax * Decimal::from(100),
        }
    }
}

impl From<products::Model> for Product {
    fn from(value: products::Model) -> Self {
        Self {
            id: value.id,
            name: value.name,
            category_id: value.category_id,
            category_name: None,
            code: value.code,
            stock: value.stock,
            is_active: value.is_active,
            price: value.price,
            cost: value.cost,
            tax: value.tax * Decimal::from(100),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewProduct {
    pub name: String,
    pub category_id: Option<i32>,
    pub code: String,
    pub stock: i32,
    pub price: Decimal,
    pub cost: Decimal,
    pub tax: Decimal,
    pub created_by: String,
}

impl From<NewProduct> for products::ActiveModel {
    fn from(value: NewProduct) -> Self {
        ActiveModel {
            name: Set(value.name),
            category_id: Set(value.category_id),
            code: Set(value.code),
            stock: Set(value.stock),
            price: Set(value.price),
            cost: Set(value.cost),
            tax: Set(value.tax / Decimal::from(100)), // Convertir porcentaje (12) a decimal (0.12)
            created_by: Set(value.created_by.clone()),
            updated_by: Set(value.created_by), // Al crear, created_by = updated_by
            ..Default::default()
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateProduct {
    pub name: Option<String>,
    pub category_id: Option<i32>,
    pub code: Option<String>,
    pub stock: Option<i32>,
    pub is_active: Option<bool>,
    pub price: Option<Decimal>,
    pub cost: Option<Decimal>,
    pub tax: Option<Decimal>,
    pub updated_by: String,
}

impl From<UpdateProduct> for products::ActiveModel {
    fn from(value: UpdateProduct) -> Self {
        let mut active_model = ActiveModel::default();

        if let Some(name) = value.name {
            active_model.name = Set(name);
        }
        if let Some(category_id) = value.category_id {
            active_model.category_id = Set(Some(category_id));
        }
        if let Some(code) = value.code {
            active_model.code = Set(code);
        }
        if let Some(stock) = value.stock {
            active_model.stock = Set(stock);
        }
        if let Some(is_active) = value.is_active {
            active_model.is_active = Set(is_active);
        }
        if let Some(price) = value.price {
            active_model.price = Set(price);
        }
        if let Some(cost) = value.cost {
            active_model.cost = Set(cost);
        }
        if let Some(tax) = value.tax {
            active_model.tax = Set(tax / Decimal::from(100)); // Convertir porcentaje a decimal
        }

        // Siempre actualizar updated_by
        active_model.updated_by = Set(value.updated_by);

        active_model
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProductFilter {
    pub status: bool,
    pub page: u64,
    pub limit: u64,
}

// #[derive(Serialize, Deserialize, Debug)]
// pub struct ProductPagesInfo {
//     pub total_pages: u64,
//     pub total_items: u64,
// }

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductListReturn {
    pub products: Vec<Product>,
    pub total_pages: u64,
    pub total_items: u64,
}
