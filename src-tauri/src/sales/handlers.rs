use sea_orm::{
    prelude::Decimal, ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, QuerySelect, TransactionTrait,
};

use super::structs::{
    CreateSaleRequest, CreateSaleResponse, PaymentMethodResponse, Sale, SaleFilter,
    SaleListResponse,
};
use crate::entities::{
    payment_methods,
    prelude::{PaymentMethods, Products, Sales},
    products, sale_details, sale_payments, sales,
};
use crate::sessions::require_permission;
use crate::AppState;

const DB_ERROR: &str = "Error en la base de datos";

/// Obtiene una página de ventas con filtros opcionales
#[tauri::command]
pub async fn get_sales(
    state: tauri::State<'_, AppState>,
    filters: SaleFilter,
) -> Result<SaleListResponse, String> {
    require_permission(&state, "sales.view")?;
    let db = &state.database;

    // Construir query base
    let mut query = Sales::find();

    // Filtrar por estado si se especifica
    if let Some(status) = filters.status {
        query = query.filter(sales::Column::Status.eq(status));
    }

    // Filtrar por fecha desde
    if let Some(ref date_from) = filters.date_from {
        if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(date_from, "%Y-%m-%d") {
            let datetime_from = parsed_date.and_hms_opt(0, 0, 0).unwrap();
            query = query.filter(sales::Column::CreatedAt.gte(datetime_from));
        }
    }

    // Filtrar por fecha hasta
    if let Some(ref date_to) = filters.date_to {
        if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(date_to, "%Y-%m-%d") {
            let datetime_to = parsed_date.and_hms_opt(23, 59, 59).unwrap();
            query = query.filter(sales::Column::CreatedAt.lte(datetime_to));
        }
    }

    // Contar total de items para paginación
    let total_items = query.clone().count(db).await.map_err(|_| DB_ERROR)?;

    let total_pages = if filters.limit > 0 {
        (total_items as f64 / filters.limit as f64).ceil() as u64
    } else {
        1
    };

    // Aplicar paginación y ordenamiento
    let offset = (filters.page.saturating_sub(1)) * filters.limit;
    let sales_models = query
        .order_by_desc(sales::Column::CreatedAt)
        .offset(offset)
        .limit(filters.limit)
        .all(db)
        .await
        .map_err(|_| DB_ERROR)?;

    // Convertir modelos a structs de respuesta
    let sales = sales_models.into_iter().map(Sale::from).collect();

    Ok(SaleListResponse {
        sales,
        total_pages,
        total_items,
    })
}

/// Obtiene los métodos de pago activos
#[tauri::command]
pub async fn get_payment_methods(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<PaymentMethodResponse>, String> {
    require_permission(&state, "sales.view")?;
    let db = &state.database;

    let methods = PaymentMethods::find()
        .filter(payment_methods::Column::IsActive.eq(true))
        .all(db)
        .await
        .map_err(|_| "Error al consultar métodos de pago")?;

    Ok(methods
        .into_iter()
        .map(PaymentMethodResponse::from)
        .collect())
}

/// Crea una nueva venta con sus detalles y pago
#[tauri::command]
pub async fn create_sale(
    state: tauri::State<'_, AppState>,
    request: CreateSaleRequest,
) -> Result<CreateSaleResponse, String> {
    // 1. Validar permiso
    let session = require_permission(&state, "sales.create")?;
    let db = &state.database;

    // 2. Iniciar transacción
    let txn = db
        .begin()
        .await
        .map_err(|_| "Error al iniciar transacción")?;

    // 3. Validar método de pago existe y está activo
    let payment_method = PaymentMethods::find_by_id(request.payment_method_id)
        .one(&txn)
        .await
        .map_err(|_| "Error al validar método de pago")?
        .ok_or("Método de pago no válido")?;

    if !payment_method.is_active {
        return Err("El método de pago seleccionado no está disponible".to_string());
    }

    // 4. Validar items no vacío
    if request.items.is_empty() {
        return Err("La venta debe tener al menos un producto".to_string());
    }

    // 5. Validar stock disponible para todos los productos
    for item in &request.items {
        let product = Products::find_by_id(item.product_id)
            .one(&txn)
            .await
            .map_err(|_| format!("Error al consultar producto {}", item.product_id))?
            .ok_or(format!("Producto {} no encontrado", item.product_id))?;

        if !product.is_active {
            return Err(format!("El producto '{}' no está disponible", product.name));
        }

        if product.stock < item.quantity {
            return Err(format!(
                "Stock insuficiente para '{}'. Disponible: {}, Solicitado: {}",
                product.name, product.stock, item.quantity
            ));
        }

        if item.quantity <= 0 {
            return Err("Las cantidades deben ser positivas".to_string());
        }
    }

    // 6. Generar ID de venta
    let sale_id = cuid2::create_id();

    // 7. Crear registro de venta principal
    let sale = sales::ActiveModel {
        id: Set(sale_id.clone()),
        subtotal: Set(request.subtotal),
        total: Set(request.total),
        status: Set(true),
        created_by: Set(session.user_id.clone()),
        updated_by: Set(session.user_id.clone()),
        ..Default::default()
    };

    let inserted_sale = sale
        .insert(&txn)
        .await
        .map_err(|e| format!("Error al crear venta: {:?}", e))?;

    // 8. Crear detalles de venta y actualizar stock
    for item in &request.items {
        // Calcular totales de línea
        let subtotal = item.unit_price * Decimal::from(item.quantity);
        let tax_amount = subtotal * item.tax_rate;
        let total = subtotal + tax_amount;

        // Insertar detalle
        let detail = sale_details::ActiveModel {
            sale_id: Set(sale_id.clone()),
            product_id: Set(item.product_id),
            quantity: Set(item.quantity),
            unit_price: Set(item.unit_price),
            subtotal: Set(subtotal),
            tax_rate: Set(item.tax_rate),
            tax_amount: Set(tax_amount),
            total: Set(total),
            ..Default::default()
        };

        detail
            .insert(&txn)
            .await
            .map_err(|e| format!("Error al registrar detalle de venta: {:?}", e))?;

        // Actualizar stock del producto (restar cantidad)
        let product = Products::find_by_id(item.product_id)
            .one(&txn)
            .await
            .map_err(|_| "Error al actualizar stock")?
            .ok_or("Producto no encontrado")?;

        let mut product_active: products::ActiveModel = product.into();
        product_active.stock = Set(product_active.stock.unwrap() - item.quantity);
        product_active.updated_by = Set(session.user_id.clone());

        product_active
            .update(&txn)
            .await
            .map_err(|e| format!("Error al actualizar inventario: {:?}", e))?;
    }

    // 9. Crear registro de pago
    let payment = sale_payments::ActiveModel {
        sale_id: Set(sale_id.clone()),
        payment_method_id: Set(request.payment_method_id),
        amount: Set(request.total),
        ..Default::default()
    };

    payment
        .insert(&txn)
        .await
        .map_err(|e| format!("Error al registrar pago: {:?}", e))?;

    // 10. Commit transacción
    txn.commit()
        .await
        .map_err(|_| "Error al confirmar la transacción")?;

    // 11. Retornar respuesta
    Ok(CreateSaleResponse {
        sale_id: inserted_sale.id,
        subtotal: inserted_sale.subtotal,
        total: inserted_sale.total,
        created_at: inserted_sale.created_at.to_string(),
    })
}
