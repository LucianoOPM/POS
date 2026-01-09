use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("refund_details")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(integer("refund_id").not_null())
                    .col(integer("product_id").not_null())
                    .col(integer("quantity").not_null().unsigned())
                    .col(decimal_len("unit_price", 10, 2).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .from("refund_details", "refund_id")
                            .to("refunds", "id")
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("refund_details", "product_id")
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
            .drop_table(Table::drop().table("refund_details").to_owned())
            .await
    }
}
