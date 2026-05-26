use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // (key, value, category, value_type, label, description, is_sensitive)
        let settings = vec![
            // === ERP INTEGRATION ===
            (
                "erp.enabled",
                "false",
                "erp",
                "boolean",
                "Habilitar ERP",
                "Activa la integracion con sistema ERP externo",
                false,
            ),
            (
                "erp.server_url",
                "",
                "erp",
                "string",
                "URL del Servidor ERP",
                "Direccion del servidor ERP (ej: https://erp.empresa.com/api)",
                false,
            ),
            (
                "erp.api_key",
                "",
                "erp",
                "string",
                "API Key",
                "Clave de autenticacion para el ERP",
                true,
            ),
            (
                "erp.sync_interval",
                "30",
                "erp",
                "number",
                "Intervalo de Sincronizacion (min)",
                "Frecuencia de sincronizacion automatica en minutos",
                false,
            ),
            (
                "erp.last_sync",
                "",
                "erp",
                "string",
                "Ultima Sincronizacion",
                "Fecha y hora de la ultima sincronizacion exitosa",
                false,
            ),
            // === BUSINESS INFORMATION ===
            (
                "business.name",
                "",
                "business",
                "string",
                "Nombre del Negocio",
                "Razon social o nombre comercial",
                false,
            ),
            (
                "business.address",
                "",
                "business",
                "string",
                "Direccion",
                "Direccion fiscal del negocio",
                false,
            ),
            (
                "business.phone",
                "",
                "business",
                "string",
                "Telefono",
                "Numero de telefono principal",
                false,
            ),
            (
                "business.tax_id",
                "",
                "business",
                "string",
                "RFC",
                "Registro Federal de Contribuyentes",
                false,
            ),
            (
                "business.email",
                "",
                "business",
                "string",
                "Correo Electronico",
                "Email de contacto del negocio",
                false,
            ),
            // === SALES CONFIGURATION ===
            (
                "sales.default_tax_rate",
                "0.16",
                "sales",
                "number",
                "Tasa de Impuesto por Defecto",
                "IVA u otro impuesto aplicable (ej: 0.16 para 16%)",
                false,
            ),
            (
                "sales.allow_discounts",
                "true",
                "sales",
                "boolean",
                "Permitir Descuentos",
                "Habilita la aplicacion de descuentos en ventas",
                false,
            ),
            (
                "sales.max_discount_percent",
                "50",
                "sales",
                "number",
                "Descuento Maximo (%)",
                "Porcentaje maximo de descuento permitido",
                false,
            ),
            (
                "sales.prices_include_tax",
                "false",
                "sales",
                "boolean",
                "Precios con IVA Incluido",
                "Mostrar precios con impuesto incluido",
                false,
            ),
            // === INVENTORY SETTINGS ===
            (
                "inventory.low_stock_alerts",
                "true",
                "inventory",
                "boolean",
                "Alertas de Stock Bajo",
                "Mostrar alertas cuando el inventario esta bajo",
                false,
            ),
            (
                "inventory.low_stock_threshold",
                "10",
                "inventory",
                "number",
                "Umbral de Stock Bajo",
                "Cantidad minima antes de alertar",
                false,
            ),
            // === RECEIPT/TICKET SETTINGS ===
            (
                "receipt.show_logo",
                "true",
                "receipt",
                "boolean",
                "Mostrar Logo en Ticket",
                "Incluir logotipo en tickets de venta",
                false,
            ),
            (
                "receipt.footer_text",
                "",
                "receipt",
                "string",
                "Texto de Pie de Pagina",
                "Texto personalizado al final del ticket",
                false,
            ),
            (
                "receipt.thank_you_message",
                "Gracias por su compra!",
                "receipt",
                "string",
                "Mensaje de Agradecimiento",
                "Mensaje que se muestra al cliente",
                false,
            ),
        ];

        for (key, value, category, value_type, label, description, is_sensitive) in settings {
            manager
                .exec_stmt(
                    Query::insert()
                        .into_table(Alias::new("settings"))
                        .columns([
                            Alias::new("key"),
                            Alias::new("value"),
                            Alias::new("category"),
                            Alias::new("value_type"),
                            Alias::new("label"),
                            Alias::new("description"),
                            Alias::new("is_sensitive"),
                        ])
                        .values_panic([
                            key.into(),
                            value.into(),
                            category.into(),
                            value_type.into(),
                            label.into(),
                            description.into(),
                            is_sensitive.into(),
                        ])
                        .to_owned(),
                )
                .await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("settings"))
                    .to_owned(),
            )
            .await
    }
}
