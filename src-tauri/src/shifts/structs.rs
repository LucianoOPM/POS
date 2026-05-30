use sea_orm::prelude::Decimal;
use serde::{Deserialize, Serialize};

use crate::entities::shifts;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftFilters {
    pub status: Option<String>,
    pub date: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ShiftDetail {
    pub id: i32,
    pub user_id: String,
    pub username: Option<String>,
    pub status: String,
    pub opening_balance: Decimal,
    pub opened_at: String,
    pub closed_at: Option<String>,
    pub duration_minutes: Option<i64>,
    pub voided_by: Option<String>,
    pub voided_by_username: Option<String>,
    pub voided_at: Option<String>,
    pub void_reason: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<shifts::Model> for ShiftDetail {
    fn from(m: shifts::Model) -> Self {
        Self::from_with_users(m, None, None)
    }
}

impl ShiftDetail {
    pub fn from_with_users(
        m: shifts::Model,
        username: Option<String>,
        voided_by_username: Option<String>,
    ) -> Self {
        let duration_minutes = m
            .closed_at
            .map(|closed| (closed - m.opened_at).num_minutes());
        Self {
            id: m.id,
            user_id: m.user_id,
            username,
            status: m.status,
            opening_balance: m.opening_balance,
            opened_at: m.opened_at.to_string(),
            closed_at: m.closed_at.map(|dt| dt.to_string()),
            duration_minutes,
            voided_by: m.voided_by.clone(),
            voided_by_username,
            voided_at: m.voided_at.map(|dt| dt.to_string()),
            void_reason: m.void_reason,
            created_at: m.created_at.to_string(),
            updated_at: m.updated_at.to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub enum ShiftStatus {
    #[serde(rename = "OPEN")]
    Open,
    #[serde(rename = "PENDING_CLOSURE")]
    PendingClosure,
    #[serde(rename = "CLOSED")]
    Closed,
    #[serde(rename = "VOIDED")]
    Voided,
}

impl ShiftStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ShiftStatus::Open => "OPEN",
            ShiftStatus::PendingClosure => "PENDING_CLOSURE",
            ShiftStatus::Closed => "CLOSED",
            ShiftStatus::Voided => "VOIDED",
        }
    }

    pub fn can_reopen(&self) -> bool {
        !matches!(self, ShiftStatus::Closed | ShiftStatus::Voided)
    }
}

impl TryFrom<&str> for ShiftStatus {
    type Error = String;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "OPEN" => Ok(ShiftStatus::Open),
            "PENDING_CLOSURE" => Ok(ShiftStatus::PendingClosure),
            "CLOSED" => Ok(ShiftStatus::Closed),
            "VOIDED" => Ok(ShiftStatus::Voided),
            other => Err(format!("Estado de turno inválido: {other}")),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Shift {
    pub id: i32,
    pub user_id: String,
    pub status: String,
    pub opening_balance: Decimal,
    pub opened_at: String,
    pub closed_at: Option<String>,
    pub voided_by: Option<String>,
    pub voided_at: Option<String>,
    pub void_reason: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<shifts::Model> for Shift {
    fn from(m: shifts::Model) -> Self {
        Self {
            id: m.id,
            user_id: m.user_id,
            status: m.status,
            opening_balance: m.opening_balance,
            opened_at: m.opened_at.to_string(),
            closed_at: m.closed_at.map(|dt| dt.to_string()),
            voided_by: m.voided_by,
            voided_at: m.voided_at.map(|dt| dt.to_string()),
            void_reason: m.void_reason,
            created_at: m.created_at.to_string(),
            updated_at: m.updated_at.to_string(),
        }
    }
}
