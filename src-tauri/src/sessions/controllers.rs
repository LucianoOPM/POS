use crate::sessions::models::Session;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

use crate::entities::prelude::{Profiles, Users};
use crate::entities::users;
use crate::AppState;
use bcrypt::verify;

use super::models::LoginData;

const ALREADY_LOGGED: &str = "You are already logged in";
const DB_ERROR: &str = "Error on db connection";
const DB_NOT_FOUND: &str = "User not found";
const INVALID_CREDENTIALS: &str = "Invalid credentials";
const NOT_LOGGED: &str = "You are not logged in";
const NO_PROFILE: &str = "User has no profile";

fn is_session_active(state: &tauri::State<'_, AppState>) -> Result<bool, &'static str> {
    let session = state.session.lock().map_err(|_| "Session lock poisoned")?;
    Ok(session.is_some())
}

#[tauri::command]
pub async fn login(
    state: tauri::State<'_, AppState>,
    user_data: LoginData,
) -> Result<Session, &'static str> {
    if is_session_active(&state)? {
        return Err(ALREADY_LOGGED);
    }

    let db = &state.database;
    let user_with_profile = Users::find()
        .find_also_related(Profiles)
        .filter(
            users::Column::Username
                .eq(&user_data.username)
                .and(users::Column::IsActive.eq(true)),
        )
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let (user, profile) = match user_with_profile {
        Some((user, Some(profile))) => (user, profile),
        Some(_) => return Err(NO_PROFILE),
        None => return Err(DB_NOT_FOUND),
    };

    if !profile.is_active {
        return Err(NO_PROFILE);
    }

    let password_ok =
        verify(user_data.password, &user.password).map_err(|_| "Error on password verification")?;
    if !password_ok {
        return Err(INVALID_CREDENTIALS);
    }

    let session = Session {
        username: user.username,
        role: profile.name,
        email: user.email,
    };
    let session_clone = session.clone();
    *state.session.lock().map_err(|_| "Session lock poisoned")? = Some(session);

    Ok(session_clone)
}

#[tauri::command]
pub async fn logout(state: tauri::State<'_, AppState>) -> Result<(), &'static str> {
    if !is_session_active(&state)? {
        return Err(NOT_LOGGED);
    }
    *state.session.lock().map_err(|_| "Session lock poisoned")? = None;
    Ok(())
}

#[tauri::command]
pub async fn get_session(state: tauri::State<'_, AppState>) -> Result<Session, &'static str> {
    if !is_session_active(&state)? {
        return Err(NOT_LOGGED);
    }
    let session = state.session.lock().map_err(|_| "Session lock poisoned")?;
    Ok(session.clone().unwrap())
}
