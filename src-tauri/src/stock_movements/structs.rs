use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StockMovement {
    pub id: i32,
    pub product_id: i32,
    pub product_name: Option<String>,
    pub movement_type: String,
    pub quantity: i32,
    pub previous_stock: i32,
    pub new_stock: i32,
    pub reason: String,
    pub notes: Option<String>,
    pub created_by: String,
    pub created_by_username: Option<String>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewStockMovement {
    pub product_id: i32,
    pub movement_type: String,
    pub quantity: i32,
    pub reason: String,
    pub notes: Option<String>,
    pub created_by: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StockMovementFilter {
    pub page: u64,
    pub limit: u64,
    pub product_id: Option<i32>,
    pub movement_type: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub search: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StockMovementListReturn {
    pub movements: Vec<StockMovement>,
    pub total_pages: u64,
    pub total_items: u64,
}
