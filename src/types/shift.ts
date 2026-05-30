export interface Shift {
  id: number;
  user_id: string;
  status: "OPEN" | "PENDING_CLOSURE" | "CLOSED" | "VOIDED";
  opening_balance: string;
  opened_at: string;
  closed_at: string | null;
  voided_by: string | null;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftDetail extends Shift {
  username?: string;
  duration_minutes: number | null;
  voided_by_username?: string;
}

export interface ShiftFilters {
  status?: "OPEN" | "PENDING_CLOSURE" | "CLOSED" | "VOIDED";
  date?: string; // YYYY-MM-DD
  user_id?: string;
}

export interface OpenShiftRequest {
  user_id: string;
  opening_balance: number;
}
