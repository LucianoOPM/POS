use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("payment_methods")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(string_len("name", 100).not_null().unique_key())
                    .col(string_len("sat_key", 10).not_null().unique_key())
                    .col(boolean("is_active").not_null().default(true))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("payment_methods").to_owned())
            .await
    }
}
