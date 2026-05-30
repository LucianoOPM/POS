use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Alias::new("shifts"))
                    .add_column(ColumnDef::new(Alias::new("voided_by")).string_len(36).null())
                    .add_column(
                        ColumnDef::new(Alias::new("voided_at"))
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .add_column(ColumnDef::new(Alias::new("void_reason")).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("fk_shifts_voided_by")
                    .from(Alias::new("shifts"), Alias::new("voided_by"))
                    .to(Alias::new("users"), Alias::new("id"))
                    .on_delete(ForeignKeyAction::Restrict)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name("fk_shifts_voided_by")
                    .table(Alias::new("shifts"))
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Alias::new("shifts"))
                    .drop_column(Alias::new("voided_by"))
                    .drop_column(Alias::new("voided_at"))
                    .drop_column(Alias::new("void_reason"))
                    .to_owned(),
            )
            .await
    }
}
