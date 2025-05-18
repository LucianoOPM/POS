use crate::m20250513_044443_users::Users;
use bcrypt::{hash, DEFAULT_COST};
use dotenvy::dotenv;
use sea_orm_migration::prelude::*;
use std::env;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        dotenv().expect("Error al cargar las variables de entorno");
        let email = env::var("SEED_EMAIL").expect("Error al cargar la variable email");
        let password_raw = env::var("SEED_PASSWORD").expect("Error al cargar la variable password");
        let password = hash(password_raw, DEFAULT_COST).expect("Error al hashear la contraseña");
        let username = env::var("SEED_USERNAME").expect("Error al cargar el username");
        let insert = Query::insert()
            .into_table(Users::Table)
            .columns([
                Users::Email,
                Users::FirstName,
                Users::IdUser,
                Users::IsActive,
                Users::LastName,
                Users::Password,
                Users::ProfileId,
                Users::Username,
            ])
            .values_panic([
                Value::from(email).into(),
                Value::from("Ana Paula").into(),
                Value::from(1).into(),
                Value::from(true).into(),
                Value::from("Montiel Bustos").into(),
                Value::from(password).into(),
                Value::from(1).into(),
                Value::from(username).into(),
            ])
            .to_owned();

        manager.exec_stmt(insert).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let username = env::var("SEED_USERNAME").expect("Error al cargar el username");
        let delete = Query::delete()
            .from_table(Users::Table)
            .and_where(
                Expr::col(Users::IdUser)
                    .eq(1)
                    .and(Expr::col(Users::Username).eq(username)),
            )
            .to_owned();

        manager.exec_stmt(delete).await?;
        Ok(())
    }
}
