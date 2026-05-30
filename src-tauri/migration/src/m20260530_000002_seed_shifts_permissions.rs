use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

const SHIFT_CODES: [&str; 3] = ["shifts.open", "shifts.close", "shifts.view"];

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Insertar permisos de turnos (ON CONFLICT DO NOTHING por si se reintenta)
        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Alias::new("permissions"))
                    .columns([
                        Alias::new("code"),
                        Alias::new("name"),
                        Alias::new("module"),
                        Alias::new("description"),
                    ])
                    .values_panic([
                        "shifts.open".into(),
                        "Abrir turno".into(),
                        "shifts".into(),
                        "Permite abrir un nuevo turno de caja".into(),
                    ])
                    .values_panic([
                        "shifts.close".into(),
                        "Cerrar turno".into(),
                        "shifts".into(),
                        "Permite cerrar el turno de caja activo".into(),
                    ])
                    .values_panic([
                        "shifts.view".into(),
                        "Ver turnos".into(),
                        "shifts".into(),
                        "Permite consultar el historial de turnos".into(),
                    ])
                    .on_conflict(OnConflict::column(Alias::new("code")).do_nothing().to_owned())
                    .to_owned(),
            )
            .await?;

        // Asignar permisos usando subquery por code (sin hardcodear IDs)
        // Administrador (1): shifts.open + shifts.close + shifts.view
        let admin_codes = &SHIFT_CODES[..];
        assign_permissions(manager, 1, admin_codes).await?;

        // Cajero (2): shifts.open + shifts.view
        let cajero_codes = &["shifts.open", "shifts.view"];
        assign_permissions(manager, 2, cajero_codes).await?;

        // Gerente (3): shifts.open + shifts.close + shifts.view
        assign_permissions(manager, 3, &SHIFT_CODES[..]).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Eliminar asignaciones usando subquery por module
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("profile_permissions"))
                    .and_where(
                        Expr::col(Alias::new("permission_id")).in_subquery(
                            Query::select()
                                .column(Alias::new("id"))
                                .from(Alias::new("permissions"))
                                .and_where(Expr::col(Alias::new("module")).eq("shifts"))
                                .to_owned(),
                        ),
                    )
                    .to_owned(),
            )
            .await?;

        // Eliminar permisos de turnos
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("permissions"))
                    .and_where(Expr::col(Alias::new("module")).eq("shifts"))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

async fn assign_permissions(
    manager: &SchemaManager<'_>,
    profile_id: i32,
    codes: &[&str],
) -> Result<(), DbErr> {
    for code in codes {
        manager
            .exec_stmt(
                Query::insert()
                    .into_table(Alias::new("profile_permissions"))
                    .columns([Alias::new("profile_id"), Alias::new("permission_id")])
                    .select_from(
                        Query::select()
                            .expr(Expr::val(profile_id))
                            .column(Alias::new("id"))
                            .from(Alias::new("permissions"))
                            .and_where(Expr::col(Alias::new("code")).eq(*code))
                            .to_owned(),
                    )
                    .map_err(|e| DbErr::Custom(e.to_string()))?
                    .on_conflict(OnConflict::new().do_nothing().to_owned())
                    .to_owned(),
            )
            .await?;
    }
    Ok(())
}
