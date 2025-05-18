use dotenvy::dotenv;
use sea_orm::DatabaseConnection;
use std::env;
use tauri::{Builder, Manager};
mod db;
mod entities;
mod users;

use users::UserControllers::{create_user, get_users};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

struct AppState {
    database: DatabaseConnection,
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
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_opener::Builder::default().build())
        .setup(|app| {
            app.manage(AppState {
                database: db_connection,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_users, create_user])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
