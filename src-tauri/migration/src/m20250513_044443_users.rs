use super::m20220101_000001_create_profiles::Profiles;
use sea_orm_migration::{prelude::*, schema::*};
#[derive(DeriveMigrationName)]
pub struct Migration;

#[derive(DeriveIden)]
pub enum Users {
    Table,
    IdUser,
    ProfileId,
    Username,
    FirstName,
    LastName,
    Password,
    IsActive,
    Email,
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(pk_auto(Users::IdUser).integer().not_null())
                    .col(integer(Users::ProfileId).not_null())
                    .col(string_len(Users::Username, 100).not_null())
                    .col(string_len(Users::Password, 100).not_null())
                    .col(boolean(Users::IsActive).not_null().default(true))
                    .col(string_len(Users::Email, 100).not_null().unique_key())
                    .col(string_len(Users::FirstName, 75).not_null())
                    .col(string_len(Users::LastName, 75).not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_user_profile")
                            .from(Users::Table, Users::ProfileId)
                            .to(Profiles::Table, Profiles::IdProfile)
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}
