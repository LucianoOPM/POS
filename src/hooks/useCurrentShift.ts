import useSWR from "swr";
import { shiftsActions } from "@/actions/shifts";
import { useAuthStore } from "@/store/authStore";
import type { Shift } from "@/types/shift";

export function useCurrentShift() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data, mutate, isLoading, error } = useSWR<Shift | null>(
    isAuthenticated ? "current_shift" : null,
    shiftsActions.getCurrentShift,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
      refreshInterval: 30_000,
      shouldRetryOnError: false,
    }
  );

  return { shift: data ?? null, isLoading, hasError: !!error, refresh: () => mutate() };
}
