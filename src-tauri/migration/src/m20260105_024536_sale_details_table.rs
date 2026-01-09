use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("sale_details")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(string_len("sale_id", 36).not_null())
                    .col(integer("product_id").not_null())
                    .col(integer("quantity").not_null().unsigned())
                    .col(decimal_len("unit_price", 10, 2).not_null())
                    .col(decimal_len("subtotal", 10, 2).not_null())
                    .col(decimal_len("tax_rate", 5, 4).not_null().default(0))
                    .col(decimal_len("tax_amount", 10, 2).not_null().default(0))
                    .col(decimal_len("total", 10, 2).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from("sale_details", "sale_id")
                            .to("sales", "id")
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("sale_details", "product_id")
                            .to("products", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("sale_details").to_owned())
            .await
    }
}
