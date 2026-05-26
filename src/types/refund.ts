/**
 * Tipos para la vista de Reembolsos
 */

// Registro de reembolso para la lista
export interface RefundRecord {
  id: number;
  sale_id: string;
  amount: string; // Decimal como string desde backend
  reason: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  // Campos relacionados (join con otras tablas)
  created_by_username?: string;
  sale_total?: string;
  items_count?: number;
}

// Detalle de producto en un reembolso
export interface RefundDetailRecord {
  id: number;
  refund_id: number;
  product_id: number;
  quantity: number;
  unit_price: string; // Decimal como string desde backend
  // Campos relacionados
  product_name?: string;
  product_code?: string;
}

// Reembolso con sus detalles
export interface RefundWithDetails extends RefundRecord {
  details: RefundDetailRecord[];
}

// Respuesta paginada de reembolsos
export interface RefundListResponse {
  refunds: RefundRecord[];
  total_pages: number;
  total_items: number;
}

// Filtros para la lista de reembolsos
export interface RefundFilters {
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  reason_search?: string;
  created_by?: string;
}

// Parámetros para crear un reembolso
export interface CreateRefundRequest {
  sale_id: string;
  reason: string;
  items: RefundItemRequest[];
}

// Item individual en una solicitud de reembolso
export interface RefundItemRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
}

// Props para componentes de reembolsos
export interface RefundsTableProps {
  refunds: RefundRecord[];
  onViewDetails: (refund: RefundRecord) => void;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
  totalItems?: number;
  isLoading?: boolean;
}

export interface RefundsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  filters: RefundFilters;
  onFiltersChange: (filters: RefundFilters) => void;
}

// Types for refund creation form

// Sale item available for refund
export interface SaleItemForRefund {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  total: string;
  already_refunded: number;
  refundable_quantity: number;
}

// Sale details for refund form
export interface SaleForRefund {
  id: string;
  subtotal: string;
  total: string;
  status: boolean;
  created_at: string;
  items: SaleItemForRefund[];
  total_refunded: string;
  refundable_amount: string;
}

// Recent sale for dropdown selection
export interface RecentSale {
  id: string;
  total: string;
  created_at: string;
  items_count: number;
  has_refunds: boolean;
  refunded_amount: string;
}

// Item selection for refund form (local state)
export interface RefundItemSelection {
  product_id: number;
  product_name: string;
  quantity: number;
  max_quantity: number;
  unit_price: number;
  selected: boolean;
}
