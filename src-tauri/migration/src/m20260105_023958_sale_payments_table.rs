use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("sale_payments")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(string_len("sale_id", 36).not_null())
                    .col(integer("payment_method_id").not_null())
                    .col(decimal_len("amount", 10, 2).not_null())
                    .col(
                        timestamp_with_time_zone("created_at")
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("sale_payments", "sale_id")
                            .to("sales", "id")
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("sale_payments", "payment_method_id")
                            .to("payment_methods", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("sale_payments").to_owned())
            .await
    }
}
