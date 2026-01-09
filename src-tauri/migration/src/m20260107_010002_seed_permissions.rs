use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Seed Permissions
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
                    // === VENTAS ===
                    .values_panic([
                        "sales.create".into(),
                        "Crear ventas".into(),
                        "sales".into(),
                        "Permite realizar ventas en el punto de venta".into(),
                    ])
                    .values_panic([
                        "sales.view".into(),
                        "Ver ventas".into(),
                        "sales".into(),
                        "Permite consultar el historial de ventas".into(),
                    ])
                    .values_panic([
                        "sales.refund".into(),
                        "Realizar devoluciones".into(),
                        "sales".into(),
                        "Permite procesar devoluciones de productos".into(),
                    ])
                    .values_panic([
                        "sales.cancel".into(),
                        "Cancelar ventas".into(),
                        "sales".into(),
                        "Permite cancelar ventas realizadas".into(),
                    ])
                    // === PRODUCTOS ===
                    .values_panic([
                        "products.view".into(),
                        "Ver productos".into(),
                        "inventory".into(),
                        "Permite consultar el catálogo de productos".into(),
                    ])
                    .values_panic([
                        "products.create".into(),
                        "Crear productos".into(),
                        "inventory".into(),
                        "Permite agregar nuevos productos al inventario".into(),
                    ])
                    .values_panic([
                        "products.edit".into(),
                        "Editar productos".into(),
                        "inventory".into(),
                        "Permite modificar información de productos".into(),
                    ])
                    .values_panic([
                        "products.delete".into(),
                        "Eliminar productos".into(),
                        "inventory".into(),
                        "Permite eliminar productos del inventario".into(),
                    ])
                    // === CATEGORÍAS ===
                    .values_panic([
                        "categories.view".into(),
                        "Ver categorías".into(),
                        "inventory".into(),
                        "Permite consultar las categorías de productos".into(),
                    ])
                    .values_panic([
                        "categories.create".into(),
                        "Crear categorías".into(),
                        "inventory".into(),
                        "Permite agregar nuevas categorías".into(),
                    ])
                    .values_panic([
                        "categories.edit".into(),
                        "Editar categorías".into(),
                        "inventory".into(),
                        "Permite modificar categorías existentes".into(),
                    ])
                    .values_panic([
                        "categories.delete".into(),
                        "Eliminar categorías".into(),
                        "inventory".into(),
                        "Permite eliminar categorías".into(),
                    ])
                    // === REPORTES ===
                    .values_panic([
                        "reports.sales".into(),
                        "Reportes de ventas".into(),
                        "reports".into(),
                        "Permite ver reportes y estadísticas de ventas".into(),
                    ])
                    .values_panic([
                        "reports.inventory".into(),
                        "Reportes de inventario".into(),
                        "reports".into(),
                        "Permite ver reportes de inventario y stock".into(),
                    ])
                    .values_panic([
                        "reports.financial".into(),
                        "Reportes financieros".into(),
                        "reports".into(),
                        "Permite ver reportes de ingresos y gastos".into(),
                    ])
                    // === USUARIOS ===
                    .values_panic([
                        "users.view".into(),
                        "Ver usuarios".into(),
                        "admin".into(),
                        "Permite consultar la lista de usuarios".into(),
                    ])
                    .values_panic([
                        "users.create".into(),
                        "Crear usuarios".into(),
                        "admin".into(),
                        "Permite registrar nuevos usuarios".into(),
                    ])
                    .values_panic([
                        "users.edit".into(),
                        "Editar usuarios".into(),
                        "admin".into(),
                        "Permite modificar información de usuarios".into(),
                    ])
                    .values_panic([
                        "users.delete".into(),
                        "Eliminar usuarios".into(),
                        "admin".into(),
                        "Permite desactivar o eliminar usuarios".into(),
                    ])
                    // === PERFILES ===
                    .values_panic([
                        "profiles.view".into(),
                        "Ver perfiles".into(),
                        "admin".into(),
                        "Permite consultar los perfiles del sistema".into(),
                    ])
                    .values_panic([
                        "profiles.manage".into(),
                        "Gestionar perfiles".into(),
                        "admin".into(),
                        "Permite crear, editar y asignar permisos a perfiles".into(),
                    ])
                    .to_owned(),
            )
            .await?;

        // Asignar TODOS los permisos al Administrador (profile_id = 1)
        // Los IDs de permisos van del 1 al 21
        for permission_id in 1..=21 {
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

        // Asignar permisos al Cajero (profile_id = 2)
        // Solo: sales.create, sales.view, products.view, categories.view
        let cajero_permissions = [1, 2, 5, 9]; // IDs de los permisos
        for permission_id in cajero_permissions {
            manager
                .exec_stmt(
                    Query::insert()
                        .into_table(Alias::new("profile_permissions"))
                        .columns([Alias::new("profile_id"), Alias::new("permission_id")])
                        .values_panic([2.into(), permission_id.into()])
                        .to_owned(),
                )
                .await?;
        }

        // Asignar permisos al Gerente (profile_id = 3)
        // Ventas completas + Productos completos + Categorías completas + Reportes
        let gerente_permissions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        for permission_id in gerente_permissions {
            manager
                .exec_stmt(
                    Query::insert()
                        .into_table(Alias::new("profile_permissions"))
                        .columns([Alias::new("profile_id"), Alias::new("permission_id")])
                        .values_panic([3.into(), permission_id.into()])
                        .to_owned(),
                )
                .await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Eliminar asignaciones de permisos
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("profile_permissions"))
                    .to_owned(),
            )
            .await?;

        // Eliminar permisos
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("permissions"))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
