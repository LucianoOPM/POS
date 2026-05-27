use crate::entities::ticket_prints;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PrintStatus {
    Completed,
    Failed,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReceiptItem {
    pub name: String,
    pub quantity: i32,
    pub unit_price: String,
    pub line_total: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ReceiptContent {
    pub business_name: String,
    pub sale_id: String,
    pub cashier: String,
    pub date: String,
    pub items: Vec<ReceiptItem>,
    pub subtotal: String,
    pub tax: String,
    pub total: String,
    pub payment_method: String,
    pub reprint: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PrintJob {
    pub id: String,
    pub sale_id: String,
    pub status: PrintStatus,
    pub adapter: String,
    pub preview_text: String,
    pub created_at: String,
    pub error: Option<String>,
    pub reprint: bool,
    pub printed_by: String,
}

impl PrintJob {
    pub fn completed(
        sale_id: String,
        adapter: String,
        preview_text: String,
        reprint: bool,
        printed_by: String,
    ) -> Self {
        Self {
            id: cuid2::create_id(),
            sale_id,
            status: PrintStatus::Completed,
            adapter,
            preview_text,
            created_at: chrono::Utc::now().to_rfc3339(),
            error: None,
            reprint,
            printed_by,
        }
    }

    pub fn failed(
        sale_id: String,
        adapter: String,
        preview_text: String,
        error: String,
        reprint: bool,
        printed_by: String,
    ) -> Self {
        Self {
            id: cuid2::create_id(),
            sale_id,
            status: PrintStatus::Failed,
            adapter,
            preview_text,
            created_at: chrono::Utc::now().to_rfc3339(),
            error: Some(error),
            reprint,
            printed_by,
        }
    }
}

impl From<ticket_prints::Model> for PrintJob {
    fn from(m: ticket_prints::Model) -> Self {
        Self {
            id: m.id,
            sale_id: m.sale_id,
            status: if m.status == "failed" {
                PrintStatus::Failed
            } else {
                PrintStatus::Completed
            },
            adapter: m.adapter,
            preview_text: m.preview_text,
            created_at: m.printed_at.to_rfc3339(),
            error: m.error_msg,
            reprint: m.reprint,
            printed_by: m.printed_by,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PrinterConfig {
    pub adapter_type: String,
    pub paper_width: u8,
    pub tcp_host: Option<String>,
    pub tcp_port: Option<u16>,
    pub business_name: String,
}

impl Default for PrinterConfig {
    fn default() -> Self {
        Self {
            adapter_type: "console".to_string(),
            paper_width: 40,
            tcp_host: None,
            tcp_port: Some(9100),
            business_name: "Mi Negocio".to_string(),
        }
    }
}
