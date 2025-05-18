use super::models::{NewUser, User};
use crate::entities::{prelude::Users, users};
use crate::AppState;
use sea_orm::{prelude::*, Condition};

const DB_ERROR: &str = "Error on db connection";
const DB_EXISTS: &str = "User already exists";

#[tauri::command]
pub async fn get_users(
    state: tauri::State<'_, AppState>,
    status: bool,
) -> Result<Vec<User>, &'static str> {
    let db_connection = &state.database;
    let users_db = Users::find()
        .filter(users::Column::IsActive.eq(status))
        .all(db_connection)
        .await
        .map_err(|_| DB_ERROR)?;
    let users_list = users_db.into_iter().map(|user| User::from(user)).collect();
    Ok(users_list)
}

#[tauri::command]
pub async fn create_user(
    state: tauri::State<'_, AppState>,
    new_user: NewUser,
) -> Result<User, &'static str> {
    let db = &state.database;
    let user_db = Users::find()
        .filter(Condition::any().add(users::Column::Email.eq(&new_user.email)))
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    if user_db.is_some() {
        return Err(DB_EXISTS);
    }
    let model = users::ActiveModel::from(new_user);
    let insert_result = model.insert(db).await.map_err(|e| {
        println!("{}", e);
        return DB_ERROR;
    })?;

    Ok(User::from(insert_result))
}
