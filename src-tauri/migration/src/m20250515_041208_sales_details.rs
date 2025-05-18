use super::m20250514_045814_products::Products;
use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
pub enum PaymentMethods {
    Table,
    IdPayment,
    Name,
    IsActive,
    SatKey,
}

#[derive(DeriveIden)]
pub enum Sales {
    Table,
    IdSale,
    CreatedAt,
    Total,
    PaymentMethod,
    Status,
}

#[derive(DeriveIden)]
pub enum SalePayments {
    Table,
    IdPayment,
    SaleId,
    Total,
    Reference,
}

#[derive(DeriveIden)]
pub enum SalesDetails {
    Table,
    IdSaleDetail,
    SaleId,
    ProductId,
    Quantity,
}

#[derive(DeriveIden)]
pub enum Refounds {
    Table,
    IdRefound,
    SaleId,
    Date,
    Reason,
}

#[derive(DeriveIden)]
pub enum RefoundDetails {
    Table,
    IdRefoundDetail,
    RefoundId,
    ProductId,
    Quantity,
    UnitPrice,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PaymentMethods::Table)
                    .if_not_exists()
                    .col(pk_auto(PaymentMethods::IdPayment).not_null())
                    .col(string(PaymentMethods::Name).unique_key())
                    .col(boolean(PaymentMethods::IsActive).default(true))
                    .col(string(PaymentMethods::SatKey).unique_key().string_len(2))
                    .to_owned(),
            )
            .await?;
        manager
            .create_table(
                Table::create()
                    .table(Sales::Table)
                    .if_not_exists()
                    .col(pk_auto(Sales::IdSale).not_null())
                    .col(
                        date_time(Sales::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(decimal_len(Sales::Total, 5, 2))
                    .col(integer(Sales::PaymentMethod).not_null())
                    .col(boolean(Sales::Status).default(true))
                    .foreign_key(
                        ForeignKey::create()
                            .from(Sales::Table, Sales::PaymentMethod)
                            .to(PaymentMethods::Table, PaymentMethods::IdPayment),
                    )
                    .to_owned(),
            )
            .await?;
        manager
            .create_table(
                Table::create()
                    .table(SalePayments::Table)
                    .if_not_exists()
                    .col(pk_auto(SalePayments::IdPayment).not_null())
                    .col(integer(SalePayments::SaleId).not_null())
                    .col(integer(SalePayments::Total).decimal_len(5, 2))
                    .col(string_len(SalePayments::Reference, 100))
                    .foreign_key(
                        ForeignKey::create()
                            .from(SalePayments::Table, SalePayments::SaleId)
                            .to(Sales::Table, Sales::IdSale),
                    )
                    .to_owned(),
            )
            .await?;
        manager
            .create_table(
                Table::create()
                    .table(SalesDetails::Table)
                    .if_not_exists()
                    .col(pk_auto(SalesDetails::IdSaleDetail).not_null())
                    .col(integer(SalesDetails::SaleId).not_null())
                    .col(integer(SalesDetails::ProductId).not_null())
                    .col(integer(SalesDetails::Quantity).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from(SalesDetails::Table, SalesDetails::SaleId)
                            .to(Sales::Table, Sales::IdSale),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(SalesDetails::Table, SalesDetails::ProductId)
                            .to(Products::Table, Products::IdProduct),
                    )
                    .to_owned(),
            )
            .await?;
        manager
            .create_table(
                Table::create()
                    .table(Refounds::Table)
                    .if_not_exists()
                    .col(pk_auto(Refounds::IdRefound).not_null())
                    .col(integer(Refounds::SaleId).not_null())
                    .col(
                        date_time(Refounds::Date)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(string_len(Refounds::Reason, 100))
                    .to_owned(),
            )
            .await?;
        manager
            .create_table(
                Table::create()
                    .table(RefoundDetails::Table)
                    .if_not_exists()
                    .col(pk_auto(RefoundDetails::IdRefoundDetail).not_null())
                    .col(integer(RefoundDetails::RefoundId).not_null())
                    .col(integer(RefoundDetails::ProductId).not_null())
                    .col(integer(RefoundDetails::Quantity).not_null())
                    .col(integer(RefoundDetails::UnitPrice).decimal_len(5, 2))
                    .foreign_key(
                        ForeignKey::create()
                            .from(RefoundDetails::Table, RefoundDetails::RefoundId)
                            .to(Refounds::Table, Refounds::IdRefound),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from(RefoundDetails::Table, RefoundDetails::ProductId)
                            .to(Products::Table, Products::IdProduct),
                    )
                    .to_owned(),
            )
            .await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PaymentMethods::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Sales::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(SalePayments::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(SalesDetails::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Refounds::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(RefoundDetails::Table).to_owned())
            .await?;
        Ok(())
    }
}
