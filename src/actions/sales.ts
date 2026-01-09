import { invoke } from "@tauri-apps/api/core";
import type { CreateSaleRequest, CreateSaleResponse, PaymentMethodResponse } from "@/types";

export const salesActions = {
  /**
   * Crea una nueva venta
   */
  createSale: async (saleData: CreateSaleRequest): Promise<CreateSaleResponse> => {
    return await invoke<CreateSaleResponse>("create_sale", {
      request: saleData,
    });
  },

  /**
   * Obtiene métodos de pago activos
   */
  getPaymentMethods: async (): Promise<PaymentMethodResponse[]> => {
    return await invoke<PaymentMethodResponse[]>("get_payment_methods");
  },
};
