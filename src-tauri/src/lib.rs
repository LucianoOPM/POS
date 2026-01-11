use dotenvy::dotenv;
use std::{env, sync::Mutex};
use tauri::Manager;
mod db;
use sea_orm::DatabaseConnection;
mod categories;
mod entities;
mod products;
mod reports;
mod sales;
mod sessions;
mod utils;

use categories::handlers::{
    create_category, delete_category, get_all_categories, get_category_by_id, hard_delete_category,
    update_category,
};
use products::ProductHandlers::{create_product, delete_product, get_products, update_product};
use reports::ReportsHandler::{
    get_category_report, get_dashboard_report, get_payment_method_report, get_product_report,
    get_refunds_report, get_sales_over_time_report,
};
use sales::SalesHandler::{create_sale, get_payment_methods, get_sales};
use sessions::SessionHandler::{get_session, login, logout};
use sessions::SessionsStructs::Session;

#[derive(Debug)]
struct AppState {
    database: DatabaseConnection,
    session: Mutex<Option<Session>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tokio::main]
pub async fn run() {
    dotenv().expect("Error cargando las variables de entorno");
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL is not defined");
    let db_connection = db::get_connection(&db_url)
        .await
        .expect("Error conectando a la base de datos");

    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState {
                database: db_connection,
                session: Mutex::new(None),
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            login,
            logout,
            get_session,
            create_product,
            delete_product,
            get_products,
            update_product,
            get_all_categories,
            get_category_by_id,
            create_category,
            update_category,
            delete_category,
            hard_delete_category,
            get_sales,
            create_sale,
            get_payment_methods,
            // Reports
            get_dashboard_report,
            get_sales_over_time_report,
            get_product_report,
            get_category_report,
            get_payment_method_report,
            get_refunds_report,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
