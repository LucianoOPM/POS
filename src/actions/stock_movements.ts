import { invoke } from "@tauri-apps/api/core";
import type {
  StockMovement,
  StockMovementListResponse,
  NewStockMovement,
  StockMovementFilter,
} from "@/types";

export const stockMovementActions = {
  getMovements: (filters: StockMovementFilter) =>
    invoke<StockMovementListResponse>("get_stock_movements", { filters }),

  getProductMovements: (productId: number) =>
    invoke<StockMovement[]>("get_product_movements", { productId }),

  createMovement: (movementData: NewStockMovement) =>
    invoke<StockMovement>("create_stock_movement", { movementData }),
};
