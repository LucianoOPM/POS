use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table("profile_permissions")
                    .if_not_exists()
                    .col(integer("profile_id").not_null())
                    .col(integer("permission_id").not_null())
                    .primary_key(
                        Index::create()
                            .col("profile_id")
                            .col("permission_id"),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("profile_permissions", "profile_id")
                            .to("profiles", "id")
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .from("profile_permissions", "permission_id")
                            .to("permissions", "id")
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table("profile_permissions").to_owned())
            .await
    }
}
