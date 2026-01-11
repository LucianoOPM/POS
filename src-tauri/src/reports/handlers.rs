use crate::utils::validate_date_range;
use sea_orm::{prelude::Decimal, DatabaseBackend, FromQueryResult, Statement};

use crate::sessions::handlers::require_permission;
use crate::AppState;

use super::structs::{
    CategoryReportItem, CategoryReportParams, CategoryReportResult, DashboardParams,
    DashboardResult, PaymentMethodReportItem, PaymentMethodReportParams, PaymentMethodReportResult,
    ProductReportItem, ProductReportParams, ProductReportResult, RefundsReportParams,
    RefundsReportResult, SalesOverTimeItem, SalesOverTimeParams, SalesOverTimeResult, TimeGrouping,
    TopRefundedProduct,
};

const DB_ERROR: &str = "Error al consultar la base de datos.";

// ============================================================================
// 1. DASHBOARD EJECUTIVO DE VENTAS
// ============================================================================

#[derive(FromQueryResult)]
struct DashboardRaw {
    gross_sales: Option<Decimal>,
    total_refunded: Option<Decimal>,
    sales_count: Option<i64>,
}

#[derive(FromQueryResult)]
struct DominantPaymentRaw {
    payment_method_name: Option<String>,
    total_amount: Option<Decimal>,
}

#[derive(FromQueryResult)]
struct TopProductRaw {
    product_name: Option<String>,
    total_quantity: Option<i64>,
}

#[tauri::command]
pub async fn get_dashboard_report(
    state: tauri::State<'_, AppState>,
    params: DashboardParams,
) -> Result<DashboardResult, String> {
    require_permission(&state, "reports.view").map_err(|e| e.to_string())?;
    validate_date_range(&params.date_from, &params.date_to).map_err(|e| e.to_string())?;

    let db = &state.database;

    // Consulta principal: ventas brutas, reembolsos y conteo
    let main_query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            COALESCE(SUM(s.total), 0) as gross_sales,
            COALESCE((
                SELECT SUM(r.amount)
                FROM refunds r
                INNER JOIN sales s2 ON r.sale_id = s2.id
                WHERE s2.status = true
                AND DATE(s2.created_at) >= $1::date
                AND DATE(s2.created_at) <= $2::date
            ), 0) as total_refunded,
            COUNT(s.id) as sales_count
        FROM sales s
        WHERE s.status = true
        AND DATE(s.created_at) >= $1::date
        AND DATE(s.created_at) <= $2::date
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let main_result = DashboardRaw::find_by_statement(main_query)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .unwrap_or(DashboardRaw {
            gross_sales: Some(Decimal::ZERO),
            total_refunded: Some(Decimal::ZERO),
            sales_count: Some(0),
        });

    let gross_sales = main_result.gross_sales.unwrap_or(Decimal::ZERO);
    let total_refunded = main_result.total_refunded.unwrap_or(Decimal::ZERO);
    let sales_count = main_result.sales_count.unwrap_or(0);
    let net_sales = gross_sales - total_refunded;

    let average_ticket = if sales_count > 0 {
        net_sales / Decimal::from(sales_count)
    } else {
        Decimal::ZERO
    };

    // Método de pago dominante
    let payment_query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            pm.name as payment_method_name,
            SUM(sp.amount) as total_amount
        FROM sale_payments sp
        INNER JOIN payment_methods pm ON sp.payment_method_id = pm.id
        INNER JOIN sales s ON sp.sale_id = s.id
        WHERE s.status = true
        AND DATE(s.created_at) >= $1::date
        AND DATE(s.created_at) <= $2::date
        GROUP BY pm.id, pm.name
        ORDER BY total_amount DESC
        LIMIT 1
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let payment_result = DominantPaymentRaw::find_by_statement(payment_query)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let (dominant_payment_method, dominant_payment_amount) = match payment_result {
        Some(p) => (
            p.payment_method_name,
            p.total_amount.unwrap_or(Decimal::ZERO),
        ),
        None => (None, Decimal::ZERO),
    };

    // Producto más vendido
    let product_query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            p.name as product_name,
            SUM(sd.quantity)::bigint as total_quantity
        FROM sale_details sd
        INNER JOIN products p ON sd.product_id = p.id
        INNER JOIN sales s ON sd.sale_id = s.id
        WHERE s.status = true
        AND DATE(s.created_at) >= $1::date
        AND DATE(s.created_at) <= $2::date
        GROUP BY p.id, p.name
        ORDER BY total_quantity DESC
        LIMIT 1
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let product_result = TopProductRaw::find_by_statement(product_query)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let (top_product, top_product_quantity) = match product_result {
        Some(p) => (p.product_name, p.total_quantity.unwrap_or(0)),
        None => (None, 0),
    };

    Ok(DashboardResult {
        gross_sales,
        total_refunded,
        net_sales,
        sales_count,
        average_ticket,
        dominant_payment_method,
        dominant_payment_amount,
        top_product,
        top_product_quantity,
    })
}

// ============================================================================
// 2. REPORTE DE VENTAS EN EL TIEMPO
// ============================================================================

#[derive(FromQueryResult)]
struct SalesOverTimeRaw {
    period: Option<String>,
    net_sales: Option<Decimal>,
    sales_count: Option<i64>,
}

#[tauri::command]
pub async fn get_sales_over_time_report(
    state: tauri::State<'_, AppState>,
    params: SalesOverTimeParams,
) -> Result<SalesOverTimeResult, String> {
    require_permission(&state, "reports.view").map_err(|e| e.to_string())?;
    validate_date_range(&params.date_from, &params.date_to).map_err(|e| e.to_string())?;

    let db = &state.database;

    // Determinar el formato de agrupación según el parámetro
    let date_format = match params.grouping {
        TimeGrouping::Day => "TO_CHAR(s.created_at, 'YYYY-MM-DD')",
        TimeGrouping::Week => "TO_CHAR(s.created_at, 'IYYY-\"W\"IW')",
        TimeGrouping::Month => "TO_CHAR(s.created_at, 'YYYY-MM')",
    };

    let query_str = format!(
        r#"
        WITH sales_data AS (
            SELECT
                {date_format} as period,
                s.total as sale_total,
                COALESCE((
                    SELECT SUM(r.amount)
                    FROM refunds r
                    WHERE r.sale_id = s.id
                ), 0) as refund_total
            FROM sales s
            WHERE s.status = true
            AND DATE(s.created_at) >= $1::date
            AND DATE(s.created_at) <= $2::date
        )
        SELECT
            period,
            SUM(sale_total - refund_total) as net_sales,
            COUNT(*)::bigint as sales_count
        FROM sales_data
        GROUP BY period
        ORDER BY period
        "#,
        date_format = date_format
    );

    let query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        &query_str,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let results = SalesOverTimeRaw::find_by_statement(query)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let mut items: Vec<SalesOverTimeItem> = Vec::new();
    let mut total_net_sales = Decimal::ZERO;
    let mut total_sales_count: i64 = 0;

    for row in results {
        let net_sales = row.net_sales.unwrap_or(Decimal::ZERO);
        let sales_count = row.sales_count.unwrap_or(0);
        let average_ticket = if sales_count > 0 {
            net_sales / Decimal::from(sales_count)
        } else {
            Decimal::ZERO
        };

        total_net_sales += net_sales;
        total_sales_count += sales_count;

        items.push(SalesOverTimeItem {
            period: row.period.unwrap_or_default(),
            net_sales,
            sales_count,
            average_ticket,
        });
    }

    let total_average_ticket = if total_sales_count > 0 {
        total_net_sales / Decimal::from(total_sales_count)
    } else {
        Decimal::ZERO
    };

    Ok(SalesOverTimeResult {
        items,
        total_net_sales,
        total_sales_count,
        total_average_ticket,
    })
}

// ============================================================================
// 3. REPORTE POR PRODUCTO
// ============================================================================

#[derive(FromQueryResult)]
struct ProductReportRaw {
    product_id: i32,
    product_name: String,
    category_name: Option<String>,
    quantity_sold: Option<i64>,
    quantity_refunded: Option<i64>,
    gross_revenue: Option<Decimal>,
    refunded_amount: Option<Decimal>,
}

#[tauri::command]
pub async fn get_product_report(
    state: tauri::State<'_, AppState>,
    params: ProductReportParams,
) -> Result<ProductReportResult, String> {
    require_permission(&state, "reports.view").map_err(|e| e.to_string())?;
    validate_date_range(&params.date_from, &params.date_to).map_err(|e| e.to_string())?;

    let db = &state.database;

    // Construir filtros opcionales
    let mut conditions = String::new();
    let mut param_index = 3;

    if params.product_id.is_some() {
        conditions.push_str(&format!(" AND p.id = ${}", param_index));
        param_index += 1;
    }
    if params.category_id.is_some() {
        conditions.push_str(&format!(" AND p.category_id = ${}", param_index));
    }

    let query_str = format!(
        r#"
        SELECT
            p.id as product_id,
            p.name as product_name,
            c.name as category_name,
            COALESCE(SUM(sd.quantity), 0)::bigint as quantity_sold,
            COALESCE((
                SELECT SUM(rd.quantity)::bigint
                FROM refund_details rd
                INNER JOIN refunds r ON rd.refund_id = r.id
                INNER JOIN sales rs ON r.sale_id = rs.id
                WHERE rd.product_id = p.id
                AND DATE(rs.created_at) >= $1::date
                AND DATE(rs.created_at) <= $2::date
            ), 0)::bigint as quantity_refunded,
            COALESCE(SUM(sd.total), 0) as gross_revenue,
            COALESCE((
                SELECT SUM(rd.quantity * rd.unit_price)
                FROM refund_details rd
                INNER JOIN refunds r ON rd.refund_id = r.id
                INNER JOIN sales rs ON r.sale_id = rs.id
                WHERE rd.product_id = p.id
                AND DATE(rs.created_at) >= $1::date
                AND DATE(rs.created_at) <= $2::date
            ), 0) as refunded_amount
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sale_details sd ON sd.product_id = p.id
        LEFT JOIN sales s ON sd.sale_id = s.id AND s.status = true
            AND DATE(s.created_at) >= $1::date
            AND DATE(s.created_at) <= $2::date
        WHERE 1=1 {conditions}
        GROUP BY p.id, p.name, c.name
        HAVING COALESCE(SUM(sd.quantity), 0) > 0 OR EXISTS (
            SELECT 1 FROM refund_details rd2
            INNER JOIN refunds r2 ON rd2.refund_id = r2.id
            INNER JOIN sales s2 ON r2.sale_id = s2.id
            WHERE rd2.product_id = p.id
            AND DATE(s2.created_at) >= $1::date
            AND DATE(s2.created_at) <= $2::date
        )
        ORDER BY gross_revenue DESC
        "#,
        conditions = conditions
    );

    // Construir los valores de los parámetros
    let mut values: Vec<sea_orm::Value> = vec![
        params.date_from.clone().into(),
        params.date_to.clone().into(),
    ];

    if let Some(product_id) = params.product_id {
        values.push(product_id.into());
    }
    if let Some(category_id) = params.category_id {
        values.push(category_id.into());
    }

    let query = Statement::from_sql_and_values(DatabaseBackend::Postgres, &query_str, values);

    let results = ProductReportRaw::find_by_statement(query)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    // Calcular totales
    let mut total_quantity_sold: i64 = 0;
    let mut total_quantity_refunded: i64 = 0;
    let mut total_gross_revenue = Decimal::ZERO;
    let mut total_refunded_amount = Decimal::ZERO;

    for row in &results {
        total_quantity_sold += row.quantity_sold.unwrap_or(0);
        total_quantity_refunded += row.quantity_refunded.unwrap_or(0);
        total_gross_revenue += row.gross_revenue.unwrap_or(Decimal::ZERO);
        total_refunded_amount += row.refunded_amount.unwrap_or(Decimal::ZERO);
    }

    let total_net_revenue = total_gross_revenue - total_refunded_amount;
    let total_net_quantity = total_quantity_sold - total_quantity_refunded;

    // Construir items con porcentajes
    let items: Vec<ProductReportItem> = results
        .into_iter()
        .map(|row| {
            let quantity_sold = row.quantity_sold.unwrap_or(0);
            let quantity_refunded = row.quantity_refunded.unwrap_or(0);
            let gross_revenue = row.gross_revenue.unwrap_or(Decimal::ZERO);
            let refunded_amount = row.refunded_amount.unwrap_or(Decimal::ZERO);
            let net_revenue = gross_revenue - refunded_amount;

            let share_percentage = if total_net_revenue > Decimal::ZERO {
                (net_revenue / total_net_revenue) * Decimal::from(100)
            } else {
                Decimal::ZERO
            };

            ProductReportItem {
                product_id: row.product_id,
                product_name: row.product_name,
                category_name: row.category_name,
                quantity_sold,
                quantity_refunded,
                net_quantity: quantity_sold - quantity_refunded,
                gross_revenue,
                net_revenue,
                share_percentage,
            }
        })
        .collect();

    Ok(ProductReportResult {
        items,
        total_quantity_sold,
        total_quantity_refunded,
        total_net_quantity,
        total_gross_revenue,
        total_net_revenue,
    })
}

// ============================================================================
// 4. REPORTE POR CATEGORÍA
// ============================================================================

#[derive(FromQueryResult)]
struct CategoryReportRaw {
    category_id: Option<i32>,
    category_name: Option<String>,
    net_sales: Option<Decimal>,
    quantity_sold: Option<i64>,
}

#[tauri::command]
pub async fn get_category_report(
    state: tauri::State<'_, AppState>,
    params: CategoryReportParams,
) -> Result<CategoryReportResult, String> {
    require_permission(&state, "reports.view").map_err(|e| e.to_string())?;
    validate_date_range(&params.date_from, &params.date_to).map_err(|e| e.to_string())?;

    let db = &state.database;

    let query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        WITH category_sales AS (
            SELECT
                p.category_id,
                c.name as category_name,
                sd.quantity,
                sd.total as sale_total,
                COALESCE((
                    SELECT SUM(rd.quantity * rd.unit_price)
                    FROM refund_details rd
                    INNER JOIN refunds r ON rd.refund_id = r.id
                    WHERE r.sale_id = s.id AND rd.product_id = sd.product_id
                ), 0) as refund_total
            FROM sale_details sd
            INNER JOIN sales s ON sd.sale_id = s.id
            INNER JOIN products p ON sd.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE s.status = true
            AND DATE(s.created_at) >= $1::date
            AND DATE(s.created_at) <= $2::date
        )
        SELECT
            category_id,
            COALESCE(category_name, 'Sin categoría') as category_name,
            SUM(sale_total - refund_total) as net_sales,
            SUM(quantity)::bigint as quantity_sold
        FROM category_sales
        GROUP BY category_id, category_name
        ORDER BY net_sales DESC
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let results = CategoryReportRaw::find_by_statement(query)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    // Calcular totales
    let mut total_net_sales = Decimal::ZERO;
    let mut total_quantity_sold: i64 = 0;

    for row in &results {
        total_net_sales += row.net_sales.unwrap_or(Decimal::ZERO);
        total_quantity_sold += row.quantity_sold.unwrap_or(0);
    }

    // Construir items con porcentajes
    let items: Vec<CategoryReportItem> = results
        .into_iter()
        .map(|row| {
            let net_sales = row.net_sales.unwrap_or(Decimal::ZERO);
            let share_percentage = if total_net_sales > Decimal::ZERO {
                (net_sales / total_net_sales) * Decimal::from(100)
            } else {
                Decimal::ZERO
            };

            CategoryReportItem {
                category_id: row.category_id,
                category_name: row
                    .category_name
                    .unwrap_or_else(|| "Sin categoría".to_string()),
                net_sales,
                quantity_sold: row.quantity_sold.unwrap_or(0),
                share_percentage,
            }
        })
        .collect();

    Ok(CategoryReportResult {
        items,
        total_net_sales,
        total_quantity_sold,
    })
}

// ============================================================================
// 5. REPORTE POR MÉTODO DE PAGO
// ============================================================================

#[derive(FromQueryResult)]
struct PaymentMethodReportRaw {
    payment_method_id: i32,
    payment_method_name: String,
    total_amount: Option<Decimal>,
    transaction_count: Option<i64>,
}

#[tauri::command]
pub async fn get_payment_method_report(
    state: tauri::State<'_, AppState>,
    params: PaymentMethodReportParams,
) -> Result<PaymentMethodReportResult, String> {
    require_permission(&state, "reports.view").map_err(|e| e.to_string())?;
    validate_date_range(&params.date_from, &params.date_to).map_err(|e| e.to_string())?;

    let db = &state.database;

    let query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            pm.id as payment_method_id,
            pm.name as payment_method_name,
            SUM(sp.amount) as total_amount,
            COUNT(sp.id)::bigint as transaction_count
        FROM sale_payments sp
        INNER JOIN payment_methods pm ON sp.payment_method_id = pm.id
        INNER JOIN sales s ON sp.sale_id = s.id
        WHERE s.status = true
        AND DATE(s.created_at) >= $1::date
        AND DATE(s.created_at) <= $2::date
        GROUP BY pm.id, pm.name
        ORDER BY total_amount DESC
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let results = PaymentMethodReportRaw::find_by_statement(query)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    // Calcular totales
    let mut total_amount = Decimal::ZERO;
    let mut total_transactions: i64 = 0;

    for row in &results {
        total_amount += row.total_amount.unwrap_or(Decimal::ZERO);
        total_transactions += row.transaction_count.unwrap_or(0);
    }

    // Construir items con porcentajes
    let items: Vec<PaymentMethodReportItem> = results
        .into_iter()
        .map(|row| {
            let amount = row.total_amount.unwrap_or(Decimal::ZERO);
            let share_percentage = if total_amount > Decimal::ZERO {
                (amount / total_amount) * Decimal::from(100)
            } else {
                Decimal::ZERO
            };

            PaymentMethodReportItem {
                payment_method_id: row.payment_method_id,
                payment_method_name: row.payment_method_name,
                total_amount: amount,
                transaction_count: row.transaction_count.unwrap_or(0),
                share_percentage,
            }
        })
        .collect();

    Ok(PaymentMethodReportResult {
        items,
        total_amount,
        total_transactions,
    })
}

// ============================================================================
// 6. REPORTE DE REEMBOLSOS
// ============================================================================

#[derive(FromQueryResult)]
struct RefundsMainRaw {
    total_refunded: Option<Decimal>,
    refunds_count: Option<i64>,
    gross_sales: Option<Decimal>,
}

#[derive(FromQueryResult)]
struct TopRefundedProductRaw {
    product_id: i32,
    product_name: String,
    quantity_refunded: Option<i64>,
    amount_refunded: Option<Decimal>,
}

#[tauri::command]
pub async fn get_refunds_report(
    state: tauri::State<'_, AppState>,
    params: RefundsReportParams,
) -> Result<RefundsReportResult, String> {
    require_permission(&state, "reports.view").map_err(|e| e.to_string())?;
    validate_date_range(&params.date_from, &params.date_to).map_err(|e| e.to_string())?;

    let db = &state.database;

    // Consulta principal
    let main_query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            COALESCE((
                SELECT SUM(r.amount)
                FROM refunds r
                INNER JOIN sales s ON r.sale_id = s.id
                WHERE DATE(r.created_at) >= $1::date
                AND DATE(r.created_at) <= $2::date
            ), 0) as total_refunded,
            COALESCE((
                SELECT COUNT(r.id)::bigint
                FROM refunds r
                WHERE DATE(r.created_at) >= $1::date
                AND DATE(r.created_at) <= $2::date
            ), 0) as refunds_count,
            COALESCE((
                SELECT SUM(s.total)
                FROM sales s
                WHERE s.status = true
                AND DATE(s.created_at) >= $1::date
                AND DATE(s.created_at) <= $2::date
            ), 0) as gross_sales
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let main_result = RefundsMainRaw::find_by_statement(main_query)
        .one(db)
        .await
        .map_err(|_| DB_ERROR)?
        .unwrap_or(RefundsMainRaw {
            total_refunded: Some(Decimal::ZERO),
            refunds_count: Some(0),
            gross_sales: Some(Decimal::ZERO),
        });

    let total_refunded = main_result.total_refunded.unwrap_or(Decimal::ZERO);
    let refunds_count = main_result.refunds_count.unwrap_or(0);
    let gross_sales = main_result.gross_sales.unwrap_or(Decimal::ZERO);

    let refund_percentage = if gross_sales > Decimal::ZERO {
        (total_refunded / gross_sales) * Decimal::from(100)
    } else {
        Decimal::ZERO
    };

    // Productos más reembolsados (top 10)
    let top_products_query = Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            p.id as product_id,
            p.name as product_name,
            SUM(rd.quantity)::bigint as quantity_refunded,
            SUM(rd.quantity * rd.unit_price) as amount_refunded
        FROM refund_details rd
        INNER JOIN products p ON rd.product_id = p.id
        INNER JOIN refunds r ON rd.refund_id = r.id
        WHERE DATE(r.created_at) >= $1::date
        AND DATE(r.created_at) <= $2::date
        GROUP BY p.id, p.name
        ORDER BY quantity_refunded DESC
        LIMIT 10
        "#,
        [
            params.date_from.clone().into(),
            params.date_to.clone().into(),
        ],
    );

    let top_products_raw = TopRefundedProductRaw::find_by_statement(top_products_query)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    let top_refunded_products: Vec<TopRefundedProduct> = top_products_raw
        .into_iter()
        .map(|row| TopRefundedProduct {
            product_id: row.product_id,
            product_name: row.product_name,
            quantity_refunded: row.quantity_refunded.unwrap_or(0),
            amount_refunded: row.amount_refunded.unwrap_or(Decimal::ZERO),
        })
        .collect();

    Ok(RefundsReportResult {
        total_refunded,
        refunds_count,
        refund_percentage,
        gross_sales,
        top_refunded_products,
    })
}
