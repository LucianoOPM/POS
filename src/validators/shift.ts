import { z } from "zod";

export const openShiftSchema = z.object({
  opening_balance: z.coerce
    .number()
    .min(0, "El fondo inicial no puede ser negativo")
    .max(999_999.99, "El monto excede el límite permitido"),
});

export type OpenShiftFormValues = z.infer<typeof openShiftSchema>;

export const voidShiftSchema = z.object({
  void_reason: z
    .string()
    .min(5, "La razón debe tener al menos 5 caracteres")
    .max(500, "La razón no puede exceder 500 caracteres"),
});

export type VoidShiftFormValues = z.infer<typeof voidShiftSchema>;
