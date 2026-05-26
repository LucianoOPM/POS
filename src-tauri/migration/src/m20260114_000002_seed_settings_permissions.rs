use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add settings permissions
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
                        "settings.view".into(),
                        "Ver configuracion".into(),
                        "admin".into(),
                        "Permite ver la configuracion del sistema".into(),
                    ])
                    .values_panic([
                        "settings.edit".into(),
                        "Editar configuracion".into(),
                        "admin".into(),
                        "Permite modificar la configuracion del sistema".into(),
                    ])
                    .to_owned(),
            )
            .await?;

        // Assign to Administrator (profile_id = 1)
        // Permission IDs 22 and 23 (continuing from the 21 existing permissions)
        for permission_id in 22..=23 {
            manager
                .exec_stmt(
                    Query::insert()
                        .into_table(Alias::new("profile_permissions"))
                        .columns([Alias::new("profile_id"), Alias::new("permission_id")])
                        .values_panic([1.into(), permission_id.into()])
                        .to_owned(),
                )
                .await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Remove profile permissions
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("profile_permissions"))
                    .cond_where(
                        Expr::col(Alias::new("permission_id"))
                            .is_in([22, 23]),
                    )
                    .to_owned(),
            )
            .await?;

        // Remove permissions
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("permissions"))
                    .cond_where(
                        Expr::col(Alias::new("code"))
                            .is_in(["settings.view", "settings.edit"]),
                    )
                    .to_owned(),
            )
            .await
    }
}
