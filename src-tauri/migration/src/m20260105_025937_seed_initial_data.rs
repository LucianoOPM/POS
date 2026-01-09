use bcrypt::{DEFAULT_COST, hash};
use cuid2;
use dotenvy::dotenv;
use sea_orm_migration::prelude::*;
use std::env;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        dotenv().expect("Error al cargar las variables de entorno");

        // Seed Profiles
        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Alias::new("profiles"))
                    .columns([
                        Alias::new("name"),
                        Alias::new("description"),
                        Alias::new("is_active"),
                    ])
                    .values_panic([
                        "Administrador".into(),
                        "Acceso completo al sistema".into(),
                        true.into(),
                    ])
                    .values_panic([
                        "Cajero".into(),
                        "Puede realizar ventas y consultar inventario".into(),
                        true.into(),
                    ])
                    .values_panic([
                        "Gerente".into(),
                        "Puede gestionar inventario, ver reportes y supervisar operaciones".into(),
                        true.into(),
                    ])
                    .to_owned(),
            )
            .await?;

        // Seed Payment Methods (con claves SAT de México)
        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Alias::new("payment_methods"))
                    .columns([
                        Alias::new("name"),
                        Alias::new("sat_key"),
                        Alias::new("is_active"),
                    ])
                    .values_panic(["Efectivo".into(), "01".into(), true.into()])
                    .values_panic(["Tarjeta de Débito".into(), "28".into(), true.into()])
                    .values_panic(["Tarjeta de Crédito".into(), "04".into(), true.into()])
                    .values_panic(["Transferencia Electrónica".into(), "03".into(), true.into()])
                    .to_owned(),
            )
            .await?;

        // Seed Categories
        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Alias::new("categories"))
                    .columns([Alias::new("name"), Alias::new("is_active")])
                    .values_panic(["Bebidas".into(), true.into()])
                    .values_panic(["Snacks".into(), true.into()])
                    .values_panic(["Abarrotes".into(), true.into()])
                    .values_panic(["Lácteos".into(), true.into()])
                    .values_panic(["Panadería".into(), true.into()])
                    .values_panic(["Limpieza".into(), true.into()])
                    .values_panic(["Higiene Personal".into(), true.into()])
                    .to_owned(),
            )
            .await?;

        // Seed Usuario Administrador Inicial
        // Nota: El password debe ser hasheado con bcrypt desde el código Rust
        // Este es un placeholder que debe ser reemplazado en el primer inicio
        let user_id = cuid2::create_id();
        let email = env::var("SEED_EMAIL").expect("Error al cargar la variable email");
        let raw_password = env::var("SEED_PASSWORD").expect("Error al cargar la contraseña");
        let password = hash(raw_password, DEFAULT_COST).expect("Error al generar la contraseña");
        let username = env::var("SEED_USERNAME").expect("Error al cargar el username");

        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Alias::new("users"))
                    .columns([
                        Alias::new("id"),
                        Alias::new("profile_id"),
                        Alias::new("username"),
                        Alias::new("password"),
                        Alias::new("email"),
                        Alias::new("first_name"),
                        Alias::new("last_name"),
                        Alias::new("is_active"),
                        Alias::new("created_by"),
                        Alias::new("updated_by"),
                    ])
                    .values_panic([
                        user_id.clone().into(),
                        1.into(),
                        username.into(),
                        password.into(),
                        email.into(),
                        "Administrador".into(),
                        "Sistema".into(),
                        true.into(),
                        user_id.clone().into(), // Se auto-referencia como creador
                        user_id.into(), // Se auto-referencia como actualizador
                    ])
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Eliminar en orden inverso por las FKs
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("users"))
                    .and_where(Expr::col(Alias::new("username")).eq("admin"))
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("categories"))
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("payment_methods"))
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("profiles"))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
