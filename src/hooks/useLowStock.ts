import useSWR from "swr";
import { productActions } from "@/actions/products";
import { useAuthStore } from "@/store/authStore";

export function useLowStock() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data, mutate, isLoading } = useSWR(
    isAuthenticated ? "low_stock" : null,
    productActions.checkLowStock,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  return {
    lowStockItems: data ?? [],
    lowStockCount: data?.length ?? 0,
    isLoading,
    refresh: () => mutate(),
  };
}
