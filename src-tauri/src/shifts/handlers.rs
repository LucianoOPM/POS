use sea_orm::prelude::Decimal;
use sea_orm::EntityTrait;
use tauri::State;

use crate::entities::prelude::Users;
use crate::sessions::handlers::{get_current_session, require_permission};
use crate::AppState;
use super::repository;
use super::structs::{Shift, ShiftDetail};

#[tauri::command]
pub async fn open_shift(
    state: State<'_, AppState>,
    user_id: String,
    opening_balance: Decimal,
) -> Result<Shift, String> {
    get_current_session(&state).map_err(|e| e.to_string())?;
    let shift = repository::open_shift(&state.database, &user_id, opening_balance).await?;
    Ok(Shift::from(shift))
}

#[tauri::command]
pub async fn get_current_shift(
    state: State<'_, AppState>,
) -> Result<Option<Shift>, String> {
    get_current_session(&state).map_err(|e| e.to_string())?;
    let shift = repository::find_active_shift(&state.database).await?;
    Ok(shift.map(Shift::from))
}

#[tauri::command]
pub async fn get_shifts(
    state: State<'_, AppState>,
    status: Option<String>,
    date: Option<String>,
    user_id: Option<String>,
) -> Result<Vec<ShiftDetail>, String> {
    get_current_session(&state).map_err(|e| e.to_string())?;
    let shifts = repository::find_shifts(&state.database, status, date, user_id).await?;
    let mut result = Vec::new();
    for shift in shifts {
        let user = Users::find_by_id(&shift.user_id)
            .one(&state.database)
            .await
            .map_err(|_| "Error al obtener datos de usuario".to_string())?;
        let username = user.map(|u| u.username);

        let voided_by_username = if let Some(ref voided_by_id) = shift.voided_by {
            Users::find_by_id(voided_by_id)
                .one(&state.database)
                .await
                .map_err(|_| "Error al obtener datos de usuario".to_string())?
                .map(|u| u.username)
        } else {
            None
        };

        result.push(ShiftDetail::from_with_users(shift, username, voided_by_username));
    }
    Ok(result)
}

#[tauri::command]
pub async fn get_shift_by_id(
    state: State<'_, AppState>,
    shift_id: i32,
) -> Result<ShiftDetail, String> {
    get_current_session(&state).map_err(|e| e.to_string())?;
    let shift = repository::find_shift_by_id(&state.database, shift_id)
        .await?
        .ok_or_else(|| format!("Turno {shift_id} no encontrado"))?;
    let user = Users::find_by_id(&shift.user_id)
        .one(&state.database)
        .await
        .map_err(|_| "Error al obtener datos de usuario".to_string())?;
    let username = user.map(|u| u.username);

    let voided_by_username = if let Some(ref voided_by_id) = shift.voided_by {
        Users::find_by_id(voided_by_id)
            .one(&state.database)
            .await
            .map_err(|_| "Error al obtener datos de usuario".to_string())?
            .map(|u| u.username)
    } else {
        None
    };

    Ok(ShiftDetail::from_with_users(shift, username, voided_by_username))
}

#[tauri::command]
pub async fn start_shift_closure(state: State<'_, AppState>) -> Result<Shift, String> {
    get_current_session(&state).map_err(|e| e.to_string())?;
    let shift = repository::find_open_shift(&state.database)
        .await?
        .ok_or_else(|| "No hay un turno ABIERTO activo".to_string())?;
    let updated = repository::transition_shift(
        &state.database,
        shift.id,
        super::structs::ShiftStatus::PendingClosure,
    )
    .await?;
    Ok(Shift::from(updated))
}

#[tauri::command]
pub async fn complete_shift_closure(state: State<'_, AppState>) -> Result<Shift, String> {
    get_current_session(&state).map_err(|e| e.to_string())?;
    let shift = repository::find_pending_closure_shift(&state.database)
        .await?
        .ok_or_else(|| "No hay un turno PENDIENTE DE CIERRE".to_string())?;
    let updated = repository::transition_shift(
        &state.database,
        shift.id,
        super::structs::ShiftStatus::Closed,
    )
    .await?;
    Ok(Shift::from(updated))
}

#[tauri::command]
pub async fn void_shift(
    state: State<'_, AppState>,
    shift_id: i32,
    void_reason: String,
) -> Result<Shift, String> {
    let session = require_permission(&state, "shifts.void")?;
    let updated =
        repository::void_shift(&state.database, shift_id, &session.user_id, &void_reason)
            .await?;
    Ok(Shift::from(updated))
}
