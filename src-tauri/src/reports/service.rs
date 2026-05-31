use sea_orm::{prelude::Decimal, DatabaseBackend, DatabaseConnection, FromQueryResult, Statement};

use super::structs::{
    DashboardParams, DashboardResult, SalesByDayItem, SalesByHourItem, SalesReportParams,
    SalesReportResult, SalesReportSummary,
};

const DB_ERROR: &str = "Error al consultar la base de datos.";

// ============================================================================
// 1. DASHBOARD EJECUTIVO
// ============================================================================

#[derive(FromQueryResult)]
struct DashboardMainRaw {
    gross_sales: Option<Decimal>,
    total_refunded: Option<Decimal>,
    sales_count: Option<i64>,
    total_products_sold: Option<i64>,
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

pub async fn get_dashboard(
    db: &DatabaseConnection,
    params: DashboardParams,
) -> Result<DashboardResult, String> {
    // Build optional WHERE clauses; PostgreSQL params are statement-scoped so
    // $3/$4 are shared between the outer query and all subqueries.
    let mut param_idx: usize = 3;
    let mut filter_sql = String::new();
    let mut filter_values: Vec<sea_orm::Value> = Vec::new();

    if let Some(shift_id) = params.shift_id {
        filter_sql.push_str(&format!(" AND s.shift_id = ${}", param_idx));
        filter_values.push(shift_id.into());
        param_idx += 1;
    }
    if let Some(ref user_id) = params.user_id {
        filter_sql.push_str(&format!(" AND s.created_by = ${}", param_idx));
        filter_values.push(user_id.clone().into());
    }

    let filter_s2 = filter_sql.replace(" AND s.", " AND s2.");
    let filter_s3 = filter_sql.replace(" AND s.", " AND s3.");

    // ── Query 1: main aggregation ────────────────────────────────────────────
    let main_sql = format!(
        r#"
        SELECT
            COALESCE(SUM(s.total), 0) AS gross_sales,
            COALESCE((
                SELECT SUM(r.amount)
                FROM   refunds r
                JOIN   sales s2 ON r.sale_id = s2.id
                WHERE  s2.status = true
                AND    DATE(s2.created_at) >= $1::date
                AND    DATE(s2.created_at) <= $2::date
                {filter_s2}
            ), 0) AS total_refunded,
            COUNT(s.id)::bigint AS sales_count,
            COALESCE((
                SELECT SUM(sd.quantity)::bigint
                FROM   sale_details sd
                JOIN   sales s3 ON sd.sale_id = s3.id
                WHERE  s3.status = true
                AND    DATE(s3.created_at) >= $1::date
                AND    DATE(s3.created_at) <= $2::date
                {filter_s3}
            ), 0) AS total_products_sold
        FROM   sales s
        WHERE  s.status = true
        AND    DATE(s.created_at) >= $1::date
        AND    DATE(s.created_at) <= $2::date
        {filter_sql}
        "#,
        filter_s2 = filter_s2,
        filter_s3 = filter_s3,
        filter_sql = filter_sql,
    );

    let mut main_values: Vec<sea_orm::Value> = vec![
        params.date_from.clone().into(),
        params.date_to.clone().into(),
    ];
    main_values.extend(filter_values.iter().cloned());

    let main_row = DashboardMainRaw::find_by_statement(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        &main_sql,
        main_values,
    ))
    .one(db)
    .await
    .map_err(|_| DB_ERROR)?
    .unwrap_or(DashboardMainRaw {
        gross_sales: Some(Decimal::ZERO),
        total_refunded: Some(Decimal::ZERO),
        sales_count: Some(0),
        total_products_sold: Some(0),
    });

    let gross_sales = main_row.gross_sales.unwrap_or(Decimal::ZERO);
    let total_refunded = main_row.total_refunded.unwrap_or(Decimal::ZERO);
    let sales_count = main_row.sales_count.unwrap_or(0);
    let total_products_sold = main_row.total_products_sold.unwrap_or(0);
    let net_sales = gross_sales - total_refunded;
    let average_ticket = if sales_count > 0 {
        net_sales / Decimal::from(sales_count)
    } else {
        Decimal::ZERO
    };

    // ── Query 2: dominant payment method ────────────────────────────────────
    let payment_sql = format!(
        r#"
        SELECT
            pm.name AS payment_method_name,
            SUM(sp.amount) AS total_amount
        FROM   sale_payments sp
        JOIN   payment_methods pm ON sp.payment_method_id = pm.id
        JOIN   sales s            ON sp.sale_id = s.id
        WHERE  s.status = true
        AND    DATE(s.created_at) >= $1::date
        AND    DATE(s.created_at) <= $2::date
        {filter_sql}
        GROUP  BY pm.id, pm.name
        ORDER  BY total_amount DESC
        LIMIT  1
        "#,
        filter_sql = filter_sql,
    );

    let mut payment_values: Vec<sea_orm::Value> = vec![
        params.date_from.clone().into(),
        params.date_to.clone().into(),
    ];
    payment_values.extend(filter_values.iter().cloned());

    let payment_row = DominantPaymentRaw::find_by_statement(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        &payment_sql,
        payment_values,
    ))
    .one(db)
    .await
    .map_err(|_| DB_ERROR)?;

    let (dominant_payment_method, dominant_payment_amount) = match payment_row {
        Some(p) => (
            p.payment_method_name,
            p.total_amount.unwrap_or(Decimal::ZERO),
        ),
        None => (None, Decimal::ZERO),
    };

    // ── Query 3: top product ─────────────────────────────────────────────────
    let product_sql = format!(
        r#"
        SELECT
            p.name AS product_name,
            SUM(sd.quantity)::bigint AS total_quantity
        FROM   sale_details sd
        JOIN   products p ON sd.product_id = p.id
        JOIN   sales s    ON sd.sale_id = s.id
        WHERE  s.status = true
        AND    DATE(s.created_at) >= $1::date
        AND    DATE(s.created_at) <= $2::date
        {filter_sql}
        GROUP  BY p.id, p.name
        ORDER  BY total_quantity DESC
        LIMIT  1
        "#,
        filter_sql = filter_sql,
    );

    let mut product_values: Vec<sea_orm::Value> = vec![
        params.date_from.clone().into(),
        params.date_to.clone().into(),
    ];
    product_values.extend(filter_values);

    let product_row = TopProductRaw::find_by_statement(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        &product_sql,
        product_values,
    ))
    .one(db)
    .await
    .map_err(|_| DB_ERROR)?;

    let (top_product, top_product_quantity) = match product_row {
        Some(p) => (p.product_name, p.total_quantity.unwrap_or(0)),
        None => (None, 0),
    };

    Ok(DashboardResult {
        gross_sales,
        total_refunded,
        net_sales,
        sales_count,
        average_ticket,
        total_products_sold,
        dominant_payment_method,
        dominant_payment_amount,
        top_product,
        top_product_quantity,
    })
}

// ============================================================================
// 7. REPORTE DETALLADO DE VENTAS
// ============================================================================

#[derive(FromQueryResult)]
struct SalesReportSummaryRaw {
    gross_sales: Option<Decimal>,
    sales_count: Option<i64>,
}

#[derive(FromQueryResult)]
struct SalesByDayRaw {
    date: Option<String>,
    gross_sales: Option<Decimal>,
    sales_count: Option<i64>,
}

#[derive(FromQueryResult)]
struct SalesByHourRaw {
    hour: Option<i32>,
    gross_sales: Option<Decimal>,
    sales_count: Option<i64>,
}

pub async fn get_sales_report(
    db: &DatabaseConnection,
    params: SalesReportParams,
) -> Result<SalesReportResult, String> {
    let values: [sea_orm::Value; 2] = [
        params.date_from.clone().into(),
        params.date_to.clone().into(),
    ];

    // ── Query 1: resumen agregado ────────────────────────────────────────────
    let summary_raw = SalesReportSummaryRaw::find_by_statement(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            COALESCE(SUM(s.total), 0) AS gross_sales,
            COUNT(s.id)::bigint       AS sales_count
        FROM sales s
        WHERE s.status = true
          AND DATE(s.created_at) >= $1::date
          AND DATE(s.created_at) <= $2::date
        "#,
        values.clone(),
    ))
    .one(db)
    .await
    .map_err(|_| DB_ERROR)?
    .unwrap_or(SalesReportSummaryRaw {
        gross_sales: Some(Decimal::ZERO),
        sales_count: Some(0),
    });

    let gross_sales = summary_raw.gross_sales.unwrap_or(Decimal::ZERO);
    let sales_count = summary_raw.sales_count.unwrap_or(0);
    let average_ticket = if sales_count > 0 {
        gross_sales / Decimal::from(sales_count)
    } else {
        Decimal::ZERO
    };

    // ── Query 2: ventas por día ──────────────────────────────────────────────
    let by_day_raw = SalesByDayRaw::find_by_statement(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            TO_CHAR(s.created_at, 'YYYY-MM-DD') AS date,
            SUM(s.total)                         AS gross_sales,
            COUNT(s.id)::bigint                  AS sales_count
        FROM sales s
        WHERE s.status = true
          AND DATE(s.created_at) >= $1::date
          AND DATE(s.created_at) <= $2::date
        GROUP BY TO_CHAR(s.created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
        "#,
        values.clone(),
    ))
    .all(db)
    .await
    .map_err(|_| DB_ERROR)?;

    let by_day: Vec<SalesByDayItem> = by_day_raw
        .into_iter()
        .map(|row| SalesByDayItem {
            date: row.date.unwrap_or_default(),
            gross_sales: row.gross_sales.unwrap_or(Decimal::ZERO),
            sales_count: row.sales_count.unwrap_or(0),
        })
        .collect();

    // ── Query 3: distribución por hora ──────────────────────────────────────
    let by_hour_raw = SalesByHourRaw::find_by_statement(Statement::from_sql_and_values(
        DatabaseBackend::Postgres,
        r#"
        SELECT
            EXTRACT(HOUR FROM s.created_at)::int AS hour,
            SUM(s.total)                          AS gross_sales,
            COUNT(s.id)::bigint                   AS sales_count
        FROM sales s
        WHERE s.status = true
          AND DATE(s.created_at) >= $1::date
          AND DATE(s.created_at) <= $2::date
        GROUP BY EXTRACT(HOUR FROM s.created_at)
        ORDER BY hour ASC
        "#,
        values,
    ))
    .all(db)
    .await
    .map_err(|_| DB_ERROR)?;

    let by_hour: Vec<SalesByHourItem> = by_hour_raw
        .into_iter()
        .map(|row| SalesByHourItem {
            hour: row.hour.unwrap_or(0),
            gross_sales: row.gross_sales.unwrap_or(Decimal::ZERO),
            sales_count: row.sales_count.unwrap_or(0),
        })
        .collect();

    Ok(SalesReportResult {
        summary: SalesReportSummary {
            gross_sales,
            sales_count,
            average_ticket,
        },
        by_day,
        by_hour,
    })
}
