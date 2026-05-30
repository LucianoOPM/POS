use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("stock_movements")
                    .if_not_exists()
                    .col(pk_auto(Alias::new("id")))
                    .col(integer("product_id").not_null())
                    .col(string_len("movement_type", 20).not_null())
                    .col(integer("quantity").not_null())
                    .col(integer("previous_stock").not_null())
                    .col(integer("new_stock").not_null())
                    .col(string_len("reason", 50).not_null())
                    .col(text("notes").null())
                    .col(string_len("created_by", 36).not_null())
                    .col(
                        timestamp_with_time_zone("created_at")
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("stock_movements", "product_id")
                            .to("products", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("stock_movements", "created_by")
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("stock_movements").to_owned())
            .await
    }
}
