use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
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
                        "shifts.void".into(),
                        "Anular turno".into(),
                        "shifts".into(),
                        "Permite anular un turno activo o pendiente de cierre".into(),
                    ])
                    .on_conflict(
                        OnConflict::column(Alias::new("code"))
                            .do_nothing()
                            .to_owned(),
                    )
                    .to_owned(),
            )
            .await?;

        // Administrador (1): shifts.void
        assign_permission(manager, 1, "shifts.void").await?;
        // Gerente (3): shifts.void
        assign_permission(manager, 3, "shifts.void").await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("profile_permissions"))
                    .and_where(
                        Expr::col(Alias::new("permission_id")).in_subquery(
                            Query::select()
                                .column(Alias::new("id"))
                                .from(Alias::new("permissions"))
                                .and_where(Expr::col(Alias::new("code")).eq("shifts.void"))
                                .to_owned(),
                        ),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("permissions"))
                    .and_where(Expr::col(Alias::new("code")).eq("shifts.void"))
                    .to_owned(),
            )
            .await
    }
}

async fn assign_permission(
    manager: &SchemaManager<'_>,
    profile_id: i32,
    code: &str,
) -> Result<(), DbErr> {
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
                        .and_where(Expr::col(Alias::new("code")).eq(code))
                        .to_owned(),
                )
                .map_err(|e| DbErr::Custom(e.to_string()))?
                .on_conflict(OnConflict::new().do_nothing().to_owned())
                .to_owned(),
        )
        .await
}
