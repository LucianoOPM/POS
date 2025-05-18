use sea_orm_migration::prelude::*;

use crate::m20250514_045814_products::Products;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let insert = Query::insert()
            .into_table(Products::Table)
            .columns([
                Products::Name,
                Products::BarCode,
                Products::Description,
                Products::IdProduct,
                Products::IsActive,
                Products::Stock,
                Products::UnitPrice,
            ])
            .values_panic([
                Value::from("Celular").into(),
                Value::from("110010111000").into(),
                Value::from("Celular 8GB de RAM").into(),
                Value::from(1).into(),
                Value::from(true).into(),
                Value::from(10).into(),
                Value::from(5000.00).into(),
            ])
            .values_panic([
                Value::from("Teclado").into(),
                Value::from("11111000001101").into(),
                Value::from("Teclado mecanico RGB").into(),
                Value::from(2).into(),
                Value::from(false).into(),
                Value::from(3).into(),
                Value::from(1500.00).into(),
            ])
            .to_owned();

        manager.exec_stmt(insert).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let delete = Query::delete()
            .from_table(Products::Table)
            .and_where(Expr::col(Products::IdProduct).is_in([1, 2]))
            .to_owned();
        manager.exec_stmt(delete).await?;
        Ok(())
    }
}
