use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("permissions")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(string_len("code", 50).not_null().unique_key()) // ej: "sales.create"
                    .col(string_len("name", 100).not_null()) // ej: "Crear ventas"
                    .col(string_len("module", 50).not_null()) // ej: "sales", "inventory", "admin"
                    .col(text("description").null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("permissions").to_owned())
            .await
    }
}
