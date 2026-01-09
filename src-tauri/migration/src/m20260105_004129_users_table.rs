use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("users")
                    .if_not_exists()
                    .col(string_len("id", 36).not_null().primary_key())
                    .col(integer("profile_id").not_null().default(1))
                    .col(string_len("username", 100).not_null().unique_key())
                    .col(string_len("password", 255).not_null())
                    .col(boolean("is_active").not_null().default(true))
                    .col(string_len("email", 100).not_null().unique_key())
                    .col(string_len("first_name", 75).not_null())
                    .col(string_len("last_name", 75).not_null())
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
                    .col(string("created_by"))
                    .col(string("updated_by"))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_users_profile")
                            .from("users", "profile_id")
                            .to("profiles", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("users", "created_by")
                            .to("users", "id")
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("users", "updated_by")
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
            .drop_table(Table::drop().table("users").to_owned())
            .await
    }
}
