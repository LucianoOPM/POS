pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_profiles;
mod m20250513_044443_users;
mod m20250514_045814_products;
mod m20250515_041208_sales_details;
mod m20250517_222307_seeding_profiles_data;
mod m20250517_230314_seeding_users_data;
mod m20250518_005554_seeding_products_data;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_profiles::Migration),
            Box::new(m20250513_044443_users::Migration),
            Box::new(m20250514_045814_products::Migration),
            Box::new(m20250515_041208_sales_details::Migration),
            Box::new(m20250517_222307_seeding_profiles_data::Migration),
            Box::new(m20250517_230314_seeding_users_data::Migration),
            Box::new(m20250518_005554_seeding_products_data::Migration),
        ]
    }
}
