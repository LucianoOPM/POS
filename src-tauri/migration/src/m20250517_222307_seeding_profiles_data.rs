use sea_orm_migration::prelude::*;
use sea_orm_migration::sea_orm::Value;

use crate::m20220101_000001_create_profiles::Profiles;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let insert = Query::insert()
            .into_table(Profiles::Table)
            .columns([
                Profiles::IdProfile,
                Profiles::Description,
                Profiles::IsActive,
                Profiles::Name,
            ])
            .values_panic([
                Value::from(1).into(),
                Value::from("Perfil del administrador para manejar todo respecto a la app").into(),
                Value::from(true).into(),
                Value::from("ADMIN").into(),
            ])
            .values_panic([
                Value::from(2).into(),
                Value::from("Perfil del dueño del negocio").into(),
                Value::from(true).into(),
                Value::from("OWNER").into(),
            ])
            .to_owned();

        manager.exec_stmt(insert).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let delete = Query::delete()
            .from_table(Profiles::Table)
            .and_where(Expr::col(Profiles::Name).is_in(["OWNER", "ADMIN"]))
            .to_owned();

        manager.exec_stmt(delete).await?;
        Ok(())
    }
}
