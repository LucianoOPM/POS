use dotenvy::dotenv;
use std::{env, sync::Mutex};
use tauri::Manager;
mod db;
use sea_orm::DatabaseConnection;
mod categories;
mod entities;
mod printing;
mod products;
mod refunds;
mod reports;
mod sales;
mod sessions;
mod settings;
mod users;
mod utils;

use categories::handlers::{
    create_category, delete_category, get_all_categories, get_category_by_id, hard_delete_category,
    update_category,
};
use printing::{
    configure_printer, get_print_jobs, get_printer_config, preview_receipt, print_receipt,
    PrintService, PrinterConfig,
};
use products::ProductHandlers::{
    check_low_stock, create_product, delete_product, get_products, update_product,
};
use reports::ReportsHandler::{
    get_category_report, get_dashboard_report, get_payment_method_report, get_product_report,
    get_refunds_report, get_sales_over_time_report,
};
use sales::SalesHandler::{create_sale, get_payment_methods, get_sales};
use sessions::SessionHandler::{get_session, login, logout};
use sessions::SessionsStructs::Session;
use users::UsersHandler::{create_user, get_profiles, get_users, toggle_user_status, update_user};
use refunds::RefundsHandler::{
    create_refund, delete_refund, get_recent_sales_for_refund, get_refund_by_id, get_refunds,
    get_sale_for_refund,
};
use settings::SettingsHandler::{
    get_setting, get_settings, get_settings_by_category, test_erp_connection, trigger_erp_sync,
    update_setting, update_settings_batch,
};

struct AppState {
    database: DatabaseConnection,
    session: Mutex<Option<Session>>,
    print_service: tokio::sync::Mutex<PrintService>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tokio::main]
pub async fn run() {
    dotenv().expect("Error cargando las variables de entorno");
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL is not defined");
    let db_connection = db::get_connection(&db_url)
        .await
        .expect("Error conectando a la base de datos");

    let print_service = PrintService::new(PrinterConfig::default());

    tauri::Builder::default()
        .setup(|app| {
            app.manage(AppState {
                database: db_connection,
                session: Mutex::new(None),
                print_service: tokio::sync::Mutex::new(print_service),
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
            check_low_stock,
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
            // Users
            get_users,
            toggle_user_status,
            get_profiles,
            create_user,
            update_user,
            // Refunds
            get_refunds,
            get_refund_by_id,
            create_refund,
            delete_refund,
            get_recent_sales_for_refund,
            get_sale_for_refund,
            // Settings
            get_settings,
            get_settings_by_category,
            get_setting,
            update_setting,
            update_settings_batch,
            test_erp_connection,
            trigger_erp_sync,
            // Printing
            print_receipt,
            preview_receipt,
            get_print_jobs,
            configure_printer,
            get_printer_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
