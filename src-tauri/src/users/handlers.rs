use bcrypt::{hash, DEFAULT_COST};
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect};

use super::structs::{NewUser, Profile, UpdateUser, User, UserFilter, UserListReturn};
use crate::entities::{prelude::Users, profiles, profiles::Entity as Profiles, users};
use crate::sessions::require_permission;
use crate::AppState;

const DB_ERROR: &str = "Error en la conexión a la base de datos";

/// Obtiene una página de usuarios con su perfil asociado.
#[tauri::command]
pub async fn get_users(
    state: tauri::State<'_, AppState>,
    filters: UserFilter,
) -> Result<UserListReturn, String> {
    require_permission(&state, "users.view")?;
    let db = &state.database;

    // Contar total de items para paginación
    let mut count_query = Users::find();
    if let Some(status) = filters.status {
        count_query = count_query.filter(users::Column::IsActive.eq(status));
    }

    let total_items = count_query.clone().count(db).await.map_err(|_| DB_ERROR)?;

    let total_pages = (total_items as f64 / filters.limit as f64).ceil() as u64;

    // Query con JOIN para obtener perfiles
    let offset = (filters.page - 1) * filters.limit;
    let mut query = Users::find().find_also_related(Profiles);

    if let Some(status) = filters.status {
        query = query.filter(users::Column::IsActive.eq(status));
    }

    let users_with_profiles = query
        .order_by_asc(users::Column::Username)
        .offset(offset)
        .limit(filters.limit)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let users = users_with_profiles
        .into_iter()
        .map(|(user, profile)| User::from_with_profile(user, profile))
        .collect();

    Ok(UserListReturn {
        users,
        total_pages,
        total_items,
    })
}

/// Cambia el estado activo/inactivo de un usuario.
#[tauri::command]
pub async fn toggle_user_status(
    state: tauri::State<'_, AppState>,
    user_id: String,
) -> Result<User, String> {
    require_permission(&state, "users.edit")?;
    let db = &state.database;

    use sea_orm::{ActiveModelTrait, ActiveValue};

    // Buscar el usuario
    let user = Users::find()
        .filter(users::Column::Id.eq(&user_id))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .ok_or("Usuario no encontrado".to_string())?;

    // Toggle del estado
    let new_status = !user.is_active;

    let mut active_model: users::ActiveModel = user.into();
    active_model.is_active = ActiveValue::Set(new_status);

    let updated = active_model.update(db).await.map_err(|_| DB_ERROR)?;

    // Obtener el perfil para la respuesta
    let profile = Profiles::find_by_id(updated.profile_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(User::from_with_profile(updated, profile))
}

/// Obtiene todos los perfiles activos para el select del formulario.
#[tauri::command]
pub async fn get_profiles(state: tauri::State<'_, AppState>) -> Result<Vec<Profile>, String> {
    require_permission(&state, "users.view")?;
    let db = &state.database;

    let profiles_list = Profiles::find()
        .filter(profiles::Column::IsActive.eq(true))
        .order_by_asc(profiles::Column::Name)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(profiles_list.into_iter().map(Profile::from).collect())
}

/// Crea un nuevo usuario.
#[tauri::command]
pub async fn create_user(
    state: tauri::State<'_, AppState>,
    user_data: NewUser,
) -> Result<User, String> {
    require_permission(&state, "users.create")?;
    let db = &state.database;

    use sea_orm::ActiveValue::Set;

    // Verificar que el username no exista
    let existing_username = Users::find()
        .filter(users::Column::Username.eq(&user_data.username))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    if existing_username.is_some() {
        return Err("El nombre de usuario ya está en uso".to_string());
    }

    // Verificar que el email no exista
    let existing_email = Users::find()
        .filter(users::Column::Email.eq(&user_data.email))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    if existing_email.is_some() {
        return Err("El correo electrónico ya está registrado".to_string());
    }

    // Hashear la contraseña
    let hashed_password =
        hash(&user_data.password, DEFAULT_COST).map_err(|_| "Error al procesar la contraseña")?;

    // Generar CUID2 para el usuario
    let user_id = cuid2::create_id();

    // Crear el modelo activo
    let new_user = users::ActiveModel {
        id: Set(user_id),
        username: Set(user_data.username),
        email: Set(user_data.email),
        password: Set(hashed_password),
        first_name: Set(user_data.first_name),
        last_name: Set(user_data.last_name),
        profile_id: Set(user_data.profile_id),
        is_active: Set(true),
        created_by: Set(user_data.created_by.clone()),
        updated_by: Set(user_data.created_by),
        ..Default::default()
    };

    // Insertar el usuario
    let inserted = Users::insert(new_user)
        .exec_with_returning(db)
        .await
        .map_err(|e| format!("Error al crear el usuario: {:?}", e))?;

    // Obtener el perfil para la respuesta
    let profile = Profiles::find_by_id(inserted.profile_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(User::from_with_profile(inserted, profile))
}

/// Actualiza un usuario existente.
#[tauri::command]
pub async fn update_user(
    state: tauri::State<'_, AppState>,
    user_id: String,
    update_data: UpdateUser,
) -> Result<User, String> {
    require_permission(&state, "users.edit")?;
    let db = &state.database;

    use sea_orm::{ActiveModelTrait, ActiveValue};

    // Buscar el usuario
    let user = Users::find()
        .filter(users::Column::Id.eq(&user_id))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .ok_or("Usuario no encontrado".to_string())?;

    // Verificar username único si se está actualizando
    if let Some(ref new_username) = update_data.username {
        if new_username != &user.username {
            let existing = Users::find()
                .filter(users::Column::Username.eq(new_username))
                .one(db)
                .await
                .map_err(|_| DB_ERROR)?;

            if existing.is_some() {
                return Err("El nombre de usuario ya está en uso".to_string());
            }
        }
    }

    // Verificar email único si se está actualizando
    if let Some(ref new_email) = update_data.email {
        if new_email != &user.email {
            let existing = Users::find()
                .filter(users::Column::Email.eq(new_email))
                .one(db)
                .await
                .map_err(|_| DB_ERROR)?;

            if existing.is_some() {
                return Err("El correo electrónico ya está registrado".to_string());
            }
        }
    }

    // Crear el modelo activo con los campos a actualizar
    let mut active_model: users::ActiveModel = user.into();

    if let Some(username) = update_data.username {
        active_model.username = ActiveValue::Set(username);
    }
    if let Some(email) = update_data.email {
        active_model.email = ActiveValue::Set(email);
    }
    if let Some(password) = update_data.password {
        if !password.is_empty() {
            let hashed = hash(&password, DEFAULT_COST)
                .map_err(|_| "Error al procesar la contraseña")?;
            active_model.password = ActiveValue::Set(hashed);
        }
    }
    if let Some(first_name) = update_data.first_name {
        active_model.first_name = ActiveValue::Set(first_name);
    }
    if let Some(last_name) = update_data.last_name {
        active_model.last_name = ActiveValue::Set(last_name);
    }
    if let Some(profile_id) = update_data.profile_id {
        active_model.profile_id = ActiveValue::Set(profile_id);
    }
    if let Some(is_active) = update_data.is_active {
        active_model.is_active = ActiveValue::Set(is_active);
    }

    active_model.updated_by = ActiveValue::Set(update_data.updated_by);

    // Actualizar
    let updated = active_model.update(db).await.map_err(|_| DB_ERROR)?;

    // Obtener el perfil para la respuesta
    let profile = Profiles::find_by_id(updated.profile_id)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    Ok(User::from_with_profile(updated, profile))
}
