export type MovementType = "entry" | "exit" | "adjustment" | "sale" | "refund";

export type MovementReason =
  | "purchase"
  | "loss"
  | "damaged"
  | "return"
  | "manual_adjustment"
  | "supplier_return"
  | "sale_adjustment"
  | "other"
  | "sale"
  | "refund"
  | "customer_refund";

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  movement_type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: MovementReason;
  notes?: string;
  created_by: string;
  created_by_username?: string;
  created_at: string;
}

export interface NewStockMovement {
  product_id: number;
  movement_type: MovementType;
  quantity: number;
  reason: MovementReason;
  notes?: string;
  created_by: string;
}

export interface StockMovementFilter {
  page: number;
  limit: number;
  product_id?: number;
  movement_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface StockMovementListResponse {
  movements: StockMovement[];
  total_pages: number;
  total_items: number;
}
