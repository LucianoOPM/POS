import { invoke } from "@tauri-apps/api/core";
import type { CategoryListResponse } from "@/types";

export const categoriesActions = {
  getCategories: async (): Promise<CategoryListResponse> => {
    return await invoke<CategoryListResponse>("get_all_categories", {
      filters: { status: true, search: null },
    });
  },
};
