use crate::entities::sales::{self, ActiveModel};
use cuid2;
use sea_orm::{prelude::Decimal, ActiveValue::Set};
use serde::{Deserialize, Serialize};

/// Venta (para lectura/respuesta)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Sale {
    pub id: String,
    pub subtotal: Decimal,
    pub total: Decimal,
    pub status: bool,
    pub created_at: String,
    pub updated_at: String,
    pub created_by: String,
    pub updated_by: String,
}

impl From<sales::Model> for Sale {
    fn from(value: sales::Model) -> Self {
        Self {
            id: value.id,
            subtotal: value.subtotal,
            total: value.total,
            status: value.status,
            created_at: value.created_at.to_string(),
            updated_at: value.updated_at.to_string(),
            created_by: value.created_by,
            updated_by: value.updated_by,
        }
    }
}

/// Nueva venta (para crear)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewSale {
    pub subtotal: Decimal,
    pub total: Decimal,
    pub created_by: String,
}

impl From<NewSale> for sales::ActiveModel {
    fn from(value: NewSale) -> Self {
        ActiveModel {
            id: Set(cuid2::create_id()),
            subtotal: Set(value.subtotal),
            total: Set(value.total),
            status: Set(true), // Nueva venta siempre activa
            created_by: Set(value.created_by.clone()),
            updated_by: Set(value.created_by),
            ..Default::default()
        }
    }
}

/// Actualizar venta (para editar)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct UpdateSale {
    pub subtotal: Option<Decimal>,
    pub total: Option<Decimal>,
    pub status: Option<bool>,
    pub updated_by: String,
}

impl UpdateSale {
    pub fn into_active_model(self, id: String) -> sales::ActiveModel {
        let mut active_model = ActiveModel {
            id: Set(id),
            ..Default::default()
        };

        if let Some(subtotal) = self.subtotal {
            active_model.subtotal = Set(subtotal);
        }
        if let Some(total) = self.total {
            active_model.total = Set(total);
        }
        if let Some(status) = self.status {
            active_model.status = Set(status);
        }

        active_model.updated_by = Set(self.updated_by);
        active_model
    }
}

/// Filtros para obtener ventas
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleFilter {
    pub status: Option<bool>,
    pub page: u64,
    pub limit: u64,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
}

/// Respuesta paginada de ventas
#[derive(Debug, Serialize, Deserialize)]
pub struct SaleListResponse {
    pub sales: Vec<Sale>,
    pub total_pages: u64,
    pub total_items: u64,
}

// Request para item individual de venta
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleItemRequest {
    pub product_id: i32,
    pub quantity: i32,
    pub unit_price: Decimal,
    pub tax_rate: Decimal, // 0.16 para 16%
}

// Request para crear venta completa
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateSaleRequest {
    pub items: Vec<SaleItemRequest>,
    pub payment_method_id: i32,
    pub subtotal: Decimal,
    pub total: Decimal,
}

// Respuesta de venta creada
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CreateSaleResponse {
    pub sale_id: String,
    pub subtotal: Decimal,
    pub total: Decimal,
    pub created_at: String,
}

// Método de pago para frontend
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PaymentMethodResponse {
    pub id: i32,
    pub name: String,
    pub sat_key: String,
}

impl From<crate::entities::payment_methods::Model> for PaymentMethodResponse {
    fn from(model: crate::entities::payment_methods::Model) -> Self {
        Self {
            id: model.id,
            name: model.name,
            sat_key: model.sat_key,
        }
    }
}
