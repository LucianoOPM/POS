use crate::entities::refunds::{self, ActiveModel};
use sea_orm::{prelude::Decimal, ActiveValue::Set};
use serde::{Deserialize, Serialize};

/// Refund response struct (for sending to frontend)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Refund {
    pub id: i32,
    pub sale_id: String,
    pub amount: Decimal,
    pub reason: String,
    pub created_at: String,
    pub updated_at: String,
    pub created_by: String,
    pub updated_by: String,
    // Related fields from joins
    pub created_by_username: Option<String>,
    pub sale_total: Option<Decimal>,
    pub items_count: Option<i64>,
}

impl From<refunds::Model> for Refund {
    fn from(value: refunds::Model) -> Self {
        Self {
            id: value.id,
            sale_id: value.sale_id,
            amount: value.amount,
            reason: value.reason,
            created_at: value.created_at.to_string(),
            updated_at: value.updated_at.to_string(),
            created_by: value.created_by,
            updated_by: value.updated_by,
            created_by_username: None,
            sale_total: None,
            items_count: None,
        }
    }
}

impl Refund {
    pub fn from_with_relations(
        refund: refunds::Model,
        created_by_username: Option<String>,
        sale_total: Option<Decimal>,
        items_count: Option<i64>,
    ) -> Self {
        Self {
            id: refund.id,
            sale_id: refund.sale_id,
            amount: refund.amount,
            reason: refund.reason,
            created_at: refund.created_at.to_string(),
            updated_at: refund.updated_at.to_string(),
            created_by: refund.created_by,
            updated_by: refund.updated_by,
            created_by_username,
            sale_total,
            items_count,
        }
    }
}

/// Refund detail response struct
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RefundDetail {
    pub id: i32,
    pub refund_id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub unit_price: Decimal,
    // Related fields
    pub product_name: Option<String>,
    pub product_code: Option<String>,
}

/// Refund with details response
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RefundWithDetails {
    pub refund: Refund,
    pub details: Vec<RefundDetail>,
}

/// Request struct for creating a new refund
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewRefund {
    pub sale_id: String,
    pub reason: String,
    pub items: Vec<RefundItemRequest>,
}

/// Individual item in refund request
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RefundItemRequest {
    pub product_id: i32,
    pub quantity: i32,
    pub unit_price: Decimal,
}

/// Filter struct for querying refunds
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct RefundFilter {
    pub page: u64,
    pub limit: u64,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    pub min_amount: Option<Decimal>,
    pub max_amount: Option<Decimal>,
    pub search: Option<String>,
    pub created_by: Option<String>,
}

/// Paginated list response
#[derive(Debug, Serialize, Deserialize)]
pub struct RefundListReturn {
    pub refunds: Vec<Refund>,
    pub total_pages: u64,
    pub total_items: u64,
}

/// Response after creating a refund
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateRefundResponse {
    pub id: i32,
    pub sale_id: String,
    pub amount: Decimal,
    pub reason: String,
    pub created_at: String,
    pub items_count: usize,
}

/// Convert NewRefund to refunds ActiveModel (used after calculating amount)
impl NewRefund {
    pub fn to_active_model(&self, amount: Decimal, user_id: String) -> ActiveModel {
        ActiveModel {
            sale_id: Set(self.sale_id.clone()),
            amount: Set(amount),
            reason: Set(self.reason.clone()),
            created_by: Set(user_id.clone()),
            updated_by: Set(user_id),
            ..Default::default()
        }
    }
}

/// Sale item for refund form (shows what can be refunded)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleItemForRefund {
    pub id: i32,
    pub product_id: i32,
    pub product_name: String,
    pub product_code: String,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub subtotal: Decimal,
    pub tax_rate: Decimal,
    pub tax_amount: Decimal,
    pub total: Decimal,
    /// Quantity already refunded for this product in this sale
    pub already_refunded: i32,
    /// Maximum quantity that can still be refunded
    pub refundable_quantity: i32,
}

/// Sale details for refund form
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleForRefund {
    pub id: String,
    pub subtotal: Decimal,
    pub total: Decimal,
    pub status: bool,
    pub created_at: String,
    pub items: Vec<SaleItemForRefund>,
    /// Total amount already refunded for this sale
    pub total_refunded: Decimal,
    /// Maximum amount that can still be refunded
    pub refundable_amount: Decimal,
}

/// Recent sale for dropdown selection
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RecentSale {
    pub id: String,
    pub total: Decimal,
    pub created_at: String,
    pub items_count: i64,
    /// Whether this sale has any refunds
    pub has_refunds: bool,
    /// Total amount already refunded
    pub refunded_amount: Decimal,
}
