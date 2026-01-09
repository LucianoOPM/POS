/**
 * Tipos relacionados con el carrito de compras y ventas
 */

/** Item del carrito */
export interface CartItem {
  id: number;
  code: string;
  name: string;
  price: number;
  quantity: number;
  tax: number;
}

/** Método de pago */
export type PaymentMethod = "cash" | "card" | "voucher";

/** Estado de la venta */
export type SaleStatus = "pending" | "completed" | "cancelled";

/** Venta */
export interface Sale {
  id: number;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  status: SaleStatus;
  createdAt: Date;
}

/**
 * Request para crear venta
 */
export interface SaleItemRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number; // Como decimal: 0.16 para 16%
}

export interface CreateSaleRequest {
  items: SaleItemRequest[];
  payment_method_id: number;
  subtotal: number;
  total: number;
}

export interface CreateSaleResponse {
  sale_id: string;
  subtotal: string; // Decimal de Rust viene como string
  total: string;
  created_at: string;
}

export interface PaymentMethodResponse {
  id: number;
  name: string;
  sat_key: string;
}
