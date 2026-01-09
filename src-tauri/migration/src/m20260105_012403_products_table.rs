use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("products")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(string_len("name", 100).unique_key().not_null())
                    .col(integer("category_id").null())
                    .col(string_len("code", 100).unique_key().not_null())
                    .col(integer("stock").unsigned().default(0).not_null())
                    .col(boolean("is_active").not_null().default(true))
                    .col(decimal_len("price", 10, 2).not_null())
                    .col(decimal_len("cost", 10, 2).not_null())
                    .col(decimal_len("tax", 5, 4).not_null().default(0))
                    .col(
                        timestamp_with_time_zone("created_at")
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        timestamp_with_time_zone("updated_at")
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(string_len("created_by", 36))
                    .col(string_len("updated_by", 36))
                    .foreign_key(
                        ForeignKey::create()
                            .from("products", "category_id")
                            .to("categories", "id")
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("products", "created_by")
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("products", "updated_by")
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
            .drop_table(Table::drop().table("products").to_owned())
            .await
    }
}
