use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("ticket_prints")
                    .if_not_exists()
                    .col(string_len("id", 36).not_null().primary_key())
                    .col(string_len("sale_id", 36).not_null())
                    .col(string_len("printed_by", 36).not_null())
                    .col(string_len("adapter", 50).not_null())
                    .col(boolean("reprint").not_null().default(false))
                    .col(string_len("status", 20).not_null())
                    .col(text("error_msg").null())
                    .col(text("preview_text").not_null())
                    .col(
                        timestamp_with_time_zone("printed_at")
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("ticket_prints", "sale_id")
                            .to("sales", "id")
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("ticket_prints", "printed_by")
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
            .drop_table(Table::drop().table("ticket_prints").to_owned())
            .await
    }
}
