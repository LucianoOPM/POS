use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("settings")
                    .if_not_exists()
                    .col(integer("id").not_null().primary_key().auto_increment())
                    .col(string_len("key", 100).not_null().unique_key())
                    .col(text("value").not_null())
                    .col(string_len("category", 50).not_null())
                    .col(string_len("value_type", 20).not_null())
                    .col(string_len("label", 100).not_null())
                    .col(text("description").null())
                    .col(boolean("is_sensitive").not_null().default(false))
                    .col(
                        timestamp_with_time_zone("updated_at")
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(string_len("updated_by", 50).null())
                    .to_owned(),
            )
            .await?;

        // Create index on category for faster filtering
        manager
            .create_index(
                Index::create()
                    .name("idx_settings_category")
                    .table(Alias::new("settings"))
                    .col(Alias::new("category"))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("settings").to_owned())
            .await
    }
}
