import { invoke } from "@tauri-apps/api/core";
import type {
  RefundFilters,
  RefundListResponse,
  RefundRecord,
  CreateRefundRequest,
  SaleForRefund,
  RecentSale,
} from "@/types";

// Response types from backend
interface RefundWithDetails {
  refund: RefundRecord;
  details: RefundDetailRecord[];
}

interface RefundDetailRecord {
  id: number;
  refund_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  product_name?: string;
  product_code?: string;
}

interface CreateRefundResponse {
  id: number;
  sale_id: string;
  amount: string;
  reason: string;
  created_at: string;
  items_count: number;
}

// Filter type matching backend RefundFilter struct
interface BackendRefundFilter {
  page: number;
  limit: number;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  created_by?: string;
}

export const refundActions = {
  /**
   * Get paginated list of refunds with optional filters
   */
  getRefunds: async (
    page: number = 1,
    limit: number = 10,
    filters?: RefundFilters
  ): Promise<RefundListResponse> => {
    const backendFilters: BackendRefundFilter = {
      page,
      limit,
      date_from: filters?.date_from,
      date_to: filters?.date_to,
      min_amount: filters?.min_amount,
      max_amount: filters?.max_amount,
      search: filters?.reason_search,
      created_by: filters?.created_by,
    };

    return await invoke<RefundListResponse>("get_refunds", { filters: backendFilters });
  },

  /**
   * Get a single refund with all its details
   */
  getRefundById: async (id: number): Promise<RefundWithDetails> => {
    return await invoke<RefundWithDetails>("get_refund_by_id", { id });
  },

  /**
   * Create a new refund
   */
  createRefund: async (refundData: CreateRefundRequest): Promise<CreateRefundResponse> => {
    return await invoke<CreateRefundResponse>("create_refund", { refundData });
  },

  /**
   * Delete a refund (reverses stock changes)
   */
  deleteRefund: async (id: number): Promise<RefundRecord> => {
    return await invoke<RefundRecord>("delete_refund", { id });
  },

  /**
   * Get recent sales from the last week for refund dropdown
   */
  getRecentSalesForRefund: async (): Promise<RecentSale[]> => {
    return await invoke<RecentSale[]>("get_recent_sales_for_refund");
  },

  /**
   * Get sale details for refund form (includes products and refundable quantities)
   */
  getSaleForRefund: async (saleId: string): Promise<SaleForRefund> => {
    return await invoke<SaleForRefund>("get_sale_for_refund", { saleId });
  },
};
