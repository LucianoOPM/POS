import { invoke } from "@tauri-apps/api/core";
import type { Shift, ShiftDetail, ShiftFilters, OpenShiftRequest } from "@/types/shift";

export const shiftsActions = {
  openShift: async (request: OpenShiftRequest): Promise<Shift> => {
    return await invoke<Shift>("open_shift", {
      userId: request.user_id,
      openingBalance: request.opening_balance,
    });
  },

  getCurrentShift: async (): Promise<Shift | null> => {
    return await invoke<Shift | null>("get_current_shift");
  },

  getShifts: async (filters?: ShiftFilters): Promise<ShiftDetail[]> => {
    return await invoke<ShiftDetail[]>("get_shifts", {
      status: filters?.status ?? null,
      date: filters?.date ?? null,
      userId: filters?.user_id ?? null,
    });
  },

  getShiftById: async (shiftId: number): Promise<ShiftDetail> => {
    return await invoke<ShiftDetail>("get_shift_by_id", { shiftId });
  },

  startShiftClosure: async (): Promise<Shift> => {
    return await invoke<Shift>("start_shift_closure");
  },

  completeShiftClosure: async (): Promise<Shift> => {
    return await invoke<Shift>("complete_shift_closure");
  },

  voidShift: async (shiftId: number, voidReason: string): Promise<Shift> => {
    return await invoke<Shift>("void_shift", { shiftId, voidReason });
  },
};
