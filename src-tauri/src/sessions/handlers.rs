use crate::sessions::structs::Session;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

use crate::entities::prelude::{Permissions, ProfilePermissions, Profiles, Users};
use crate::entities::{profile_permissions, users};
use crate::AppState;
use bcrypt::verify;

use super::structs::LoginData;

// Error messages for user-facing responses
const ALREADY_LOGGED: &str = "Ya existe una sesión activa. Por favor, cierre sesión primero.";
const INVALID_CREDENTIALS: &str =
    "Usuario o contraseña incorrectos. Verifique sus credenciales e intente nuevamente.";
const NOT_LOGGED: &str = "No hay una sesión activa. Por favor, inicie sesión.";
const ACCOUNT_INACTIVE: &str = "Su cuenta está inactiva. Contacte al administrador del sistema.";

// Internal error messages
const DB_ERROR: &str = "Error al conectar con la base de datos. Intente nuevamente.";
const SESSION_LOCK_ERROR: &str = "Error interno al gestionar la sesión.";
const PASSWORD_VERIFICATION_ERROR: &str = "Error al verificar la contraseña.";
const PERMISSION_DENIED: &str = "No tiene permisos para realizar esta acción.";

fn is_session_active(state: &tauri::State<'_, AppState>) -> Result<bool, &'static str> {
    let session = state.session.lock().map_err(|_| SESSION_LOCK_ERROR)?;
    Ok(session.is_some())
}

/// Obtiene la sesión actual si existe
pub fn get_current_session(state: &tauri::State<'_, AppState>) -> Result<Session, &'static str> {
    let session = state.session.lock().map_err(|_| SESSION_LOCK_ERROR)?;
    session.clone().ok_or(NOT_LOGGED)
}

/// Verifica que el usuario tenga el permiso especificado.
/// Retorna la sesión si tiene el permiso, o un error si no.
pub fn require_permission(
    state: &tauri::State<'_, AppState>,
    permission_code: &str,
) -> Result<Session, &'static str> {
    let session = get_current_session(state)?;
    if !session.has_permission(permission_code) {
        return Err(PERMISSION_DENIED);
    }
    Ok(session)
}

/// Verifica que el usuario tenga al menos uno de los permisos especificados.
/// Retorna la sesión si tiene alguno de los permisos, o un error si no.
// pub fn require_any_permission(
//     state: &tauri::State<'_, AppState>,
//     permission_codes: &[&str],
// ) -> Result<Session, &'static str> {
//     let session = get_current_session(state)?;
//     if !session.has_any_permission(permission_codes) {
//         return Err(PERMISSION_DENIED);
//     }
//     Ok(session)
// }

#[tauri::command]
pub async fn login(
    state: tauri::State<'_, AppState>,
    user_data: LoginData,
) -> Result<Session, &'static str> {
    // Verificar si ya existe una sesión activa
    if is_session_active(&state)? {
        return Err(ALREADY_LOGGED);
    }
    let db = &state.database;

    // Buscar usuario con su perfil relacionado
    let user_with_profile = Users::find()
        .find_also_related(Profiles)
        .filter(users::Column::Username.eq(&user_data.username))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    // Validar existencia de usuario, perfil y verificar contraseña
    let (user, profile) = match user_with_profile {
        Some((user, Some(profile))) => {
            // Verificar contraseña antes de revelar cualquier información
            let password_ok = verify(user_data.password, &user.password)
                .map_err(|_| PASSWORD_VERIFICATION_ERROR)?;

            if !password_ok {
                return Err(INVALID_CREDENTIALS);
            }

            (user, profile)
        }
        // Usuario no encontrado o sin perfil - retornar mensaje genérico por seguridad
        _ => return Err(INVALID_CREDENTIALS),
    };

    // Verificar que el usuario esté activo
    if !user.is_active {
        return Err(ACCOUNT_INACTIVE);
    }

    // Verificar que el perfil esté activo
    if !profile.is_active {
        return Err(ACCOUNT_INACTIVE);
    }

    // Cargar permisos del perfil
    let profile_perms = ProfilePermissions::find()
        .filter(profile_permissions::Column::ProfileId.eq(profile.id))
        .find_also_related(Permissions)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let permissions: Vec<String> = profile_perms
        .into_iter()
        .filter_map(|(_, perm)| perm.map(|p| p.code))
        .collect();

    // Crear y almacenar la sesión
    let session = Session {
        user_id: user.id,
        username: user.username,
        profile_id: profile.id,
        profile_name: profile.name,
        email: user.email,
        permissions,
    };
    let session_clone = session.clone();

    *state.session.lock().map_err(|_| SESSION_LOCK_ERROR)? = Some(session);

    Ok(session_clone)
}

#[tauri::command]
pub async fn logout(state: tauri::State<'_, AppState>) -> Result<(), &'static str> {
    if !is_session_active(&state)? {
        return Err(NOT_LOGGED);
    }
    *state.session.lock().map_err(|_| SESSION_LOCK_ERROR)? = None;
    Ok(())
}

#[tauri::command]
pub async fn get_session(state: tauri::State<'_, AppState>) -> Result<Session, &'static str> {
    if !is_session_active(&state)? {
        return Err(NOT_LOGGED);
    }
    let session = state.session.lock().map_err(|_| SESSION_LOCK_ERROR)?;
    Ok(session.clone().unwrap())
}
