use chrono::{FixedOffset, NaiveDate, NaiveTime, TimeZone, Utc};
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, EntityTrait,
    QueryFilter, QueryOrder,
};
use sea_orm::prelude::Decimal;

use crate::entities::{prelude::Shifts, shifts};
use super::structs::ShiftStatus;

pub async fn find_open_shift(db: &DatabaseConnection) -> Result<Option<shifts::Model>, String> {
    Shifts::find()
        .filter(shifts::Column::Status.eq(ShiftStatus::Open.as_str()))
        .one(db)
        .await
        .map_err(|_| "Error al consultar turno activo".to_string())
}

pub async fn find_active_shift(db: &DatabaseConnection) -> Result<Option<shifts::Model>, String> {
    use sea_orm::Condition;
    Shifts::find()
        .filter(
            Condition::any()
                .add(shifts::Column::Status.eq(ShiftStatus::Open.as_str()))
                .add(shifts::Column::Status.eq(ShiftStatus::PendingClosure.as_str())),
        )
        .one(db)
        .await
        .map_err(|_| "Error al consultar turno activo".to_string())
}

pub async fn require_open_shift(db: &DatabaseConnection) -> Result<(), String> {
    match find_open_shift(db).await? {
        Some(_) => Ok(()),
        None => Err("No hay un turno activo. Debe abrir un turno antes de realizar operaciones.".to_string()),
    }
}

pub async fn find_pending_closure_shift(db: &DatabaseConnection) -> Result<Option<shifts::Model>, String> {
    Shifts::find()
        .filter(shifts::Column::Status.eq(ShiftStatus::PendingClosure.as_str()))
        .one(db)
        .await
        .map_err(|_| "Error al consultar turno pendiente de cierre".to_string())
}

pub async fn open_shift(
    db: &DatabaseConnection,
    user_id: &str,
    opening_balance: Decimal,
) -> Result<shifts::Model, String> {
    if find_open_shift(db).await?.is_some() {
        return Err("Ya existe un turno abierto".to_string());
    }

    let model = shifts::ActiveModel {
        user_id: Set(user_id.to_string()),
        status: Set(ShiftStatus::Open.as_str().to_string()),
        opening_balance: Set(opening_balance),
        ..Default::default()
    };

    model
        .insert(db)
        .await
        .map_err(|_| "Error al abrir turno".to_string())
}

pub async fn find_shifts(
    db: &DatabaseConnection,
    status: Option<String>,
    date: Option<String>,
    user_id: Option<String>,
) -> Result<Vec<shifts::Model>, String> {
    let mut select = Shifts::find();

    if let Some(s) = status {
        select = select.filter(shifts::Column::Status.eq(s));
    }

    if let Some(date_str) = date {
        let naive_date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|_| "Formato de fecha inválido. Use YYYY-MM-DD".to_string())?;
        let offset = FixedOffset::east_opt(0).unwrap();
        let start = offset.from_utc_datetime(
            &naive_date.and_time(NaiveTime::from_hms_opt(0, 0, 0).unwrap()),
        );
        let end = offset.from_utc_datetime(
            &naive_date.and_time(NaiveTime::from_hms_opt(23, 59, 59).unwrap()),
        );
        select = select.filter(shifts::Column::OpenedAt.between(start, end));
    }

    if let Some(uid) = user_id {
        select = select.filter(shifts::Column::UserId.eq(uid));
    }

    select
        .order_by_desc(shifts::Column::OpenedAt)
        .all(db)
        .await
        .map_err(|_| "Error al consultar turnos".to_string())
}

pub async fn find_shift_by_id(
    db: &DatabaseConnection,
    shift_id: i32,
) -> Result<Option<shifts::Model>, String> {
    Shifts::find_by_id(shift_id)
        .one(db)
        .await
        .map_err(|_| "Error al consultar turno".to_string())
}

pub async fn void_shift(
    db: &DatabaseConnection,
    shift_id: i32,
    voided_by: &str,
    void_reason: &str,
) -> Result<shifts::Model, String> {
    let shift = Shifts::find_by_id(shift_id)
        .one(db)
        .await
        .map_err(|_| "Error al buscar turno".to_string())?
        .ok_or_else(|| format!("Turno {shift_id} no encontrado"))?;

    let current = ShiftStatus::try_from(shift.status.as_str())?;

    if !matches!(current, ShiftStatus::Open | ShiftStatus::PendingClosure) {
        return Err(format!(
            "No se puede anular un turno en estado {}",
            shift.status
        ));
    }

    let now = Utc::now().fixed_offset();
    let mut active: shifts::ActiveModel = shift.into();
    active.status = Set(ShiftStatus::Voided.as_str().to_string());
    active.voided_by = Set(Some(voided_by.to_string()));
    active.voided_at = Set(Some(now));
    active.void_reason = Set(Some(void_reason.to_string()));

    active
        .update(db)
        .await
        .map_err(|_| "Error al anular turno".to_string())
}

pub async fn transition_shift(
    db: &DatabaseConnection,
    shift_id: i32,
    new_status: ShiftStatus,
) -> Result<shifts::Model, String> {
    let shift = Shifts::find_by_id(shift_id)
        .one(db)
        .await
        .map_err(|_| "Error al buscar turno".to_string())?
        .ok_or("Turno no encontrado".to_string())?;

    let current = ShiftStatus::try_from(shift.status.as_str())?;

    if matches!(new_status, ShiftStatus::Open) && !current.can_reopen() {
        return Err(format!(
            "Un turno en estado {} no puede volver a OPEN",
            shift.status
        ));
    }

    let mut active: shifts::ActiveModel = shift.into();
    active.status = Set(new_status.as_str().to_string());

    if matches!(new_status, ShiftStatus::Closed | ShiftStatus::Voided) {
        active.closed_at = Set(Some(Utc::now().fixed_offset()));
    }

    active
        .update(db)
        .await
        .map_err(|_| "Error al actualizar estado del turno".to_string())
}
