use dotenvy::dotenv;
use sea_orm::DatabaseConnection;
use std::{env, sync::Mutex};
use tauri::{Builder, Manager};
mod db;
mod entities;
mod products;
mod sessions;
mod users;

use products::ProductCommands::{create_product, delete_product, get_products, update_product};
use sessions::SessionControllers::{get_session, login, logout};
use sessions::SessionModels::Session;
use users::UserControllers::{create_user, get_users};

#[derive(Debug)]
struct AppState {
    database: DatabaseConnection,
    session: Mutex<Option<Session>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tokio::main]
pub async fn run() {
    dotenv().expect("Error loading enviroment variables");
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL is not defined");
    let db_connection = db::get_connection(&db_url)
        .await
        .expect("Error on db connection");

    Builder::default()
        .setup(|app| {
            app.manage(AppState {
                database: db_connection,
                session: Mutex::new(None),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_users,
            create_user,
            login,
            logout,
            get_session,
            get_products,
            create_product,
            update_product,
            delete_product
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
