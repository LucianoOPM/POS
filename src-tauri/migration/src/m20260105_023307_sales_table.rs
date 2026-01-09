use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("sales")
                    .if_not_exists()
                    .col(string_len("id", 36).not_null().primary_key())
                    .col(decimal_len("subtotal", 10, 2).not_null())
                    .col(decimal_len("total", 10, 2).not_null())
                    .col(boolean("status").not_null().default(true))
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
                            .from("sales", "created_by")
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("sales", "updated_by")
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
            .drop_table(Table::drop().table("sales").to_owned())
            .await
    }
}
