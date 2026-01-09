import { invoke } from "@tauri-apps/api/core";
import type { NewProduct, UpdateProduct, ProductFilter, ProductListResponse } from "@/types";

export const productActions = {
  getProducts: async (
    page: number = 1,
    limit: number = 10,
    status: boolean = true
  ): Promise<ProductListResponse> => {
    const filters: ProductFilter = { status, page, limit };
    return await invoke<ProductListResponse>("get_products", { filters });
  },

  createProduct: async (productData: NewProduct) => {
    return await invoke("create_product", {
      productData,
    });
  },

  updateProduct: async (idProduct: number, updateData: UpdateProduct) => {
    return await invoke("update_product", {
      idProduct,
      updateData,
    });
  },

  deleteProduct: async (idProduct: number) => {
    return await invoke("delete_product", { idProduct });
  },
};
