pub use sea_orm_migration::prelude::*;

mod m20260105_001346_profiles_table;
mod m20260105_004129_users_table;
mod m20260105_012400_categories_table;
mod m20260105_012403_products_table;
mod m20260105_022312_payment_methods_table;
mod m20260105_023307_sales_table;
mod m20260105_023958_sale_payments_table;
mod m20260105_024536_sale_details_table;
mod m20260105_024908_refunds_table;
mod m20260105_025655_refund_details_table;
mod m20260105_025937_seed_initial_data;
mod m20260107_010000_permissions_table;
mod m20260107_010001_profile_permissions_table;
mod m20260107_010002_seed_permissions;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20260105_001346_profiles_table::Migration),
            Box::new(m20260105_004129_users_table::Migration),
            Box::new(m20260105_012400_categories_table::Migration),
            Box::new(m20260105_012403_products_table::Migration),
            Box::new(m20260105_022312_payment_methods_table::Migration),
            Box::new(m20260105_023307_sales_table::Migration),
            Box::new(m20260105_023958_sale_payments_table::Migration),
            Box::new(m20260105_024536_sale_details_table::Migration),
            Box::new(m20260105_024908_refunds_table::Migration),
            Box::new(m20260105_025655_refund_details_table::Migration),
            Box::new(m20260105_025937_seed_initial_data::Migration),
            Box::new(m20260107_010000_permissions_table::Migration),
            Box::new(m20260107_010001_profile_permissions_table::Migration),
            Box::new(m20260107_010002_seed_permissions::Migration),
        ]
    }
}
