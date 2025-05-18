use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
pub enum Products {
    Table,
    IdProduct,
    Name,
    Stock,
    IsActive,
    UnitPrice,
    BarCode,
    Description,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Products::Table)
                    .if_not_exists()
                    .col(pk_auto(Products::IdProduct).not_null())
                    .col(string(Products::Name))
                    .col(string(Products::BarCode).unique_key())
                    .col(integer(Products::Stock).default(0))
                    .col(boolean(Products::IsActive).default(true))
                    .col(integer(Products::UnitPrice).decimal_len(10, 2))
                    .col(text(Products::Description))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Products::Table).to_owned())
            .await
    }
}
