import { z } from "zod";

export const stockMovementSchema = z.object({
  product_id: z.number().int().positive("Selecciona un producto"),
  movement_type: z.enum(["entry", "exit", "adjustment"], {
    errorMap: () => ({ message: "Tipo de movimiento inválido" }),
  }),
  quantity: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a cero"),
  reason: z.enum(
    [
      "purchase",
      "loss",
      "damaged",
      "return",
      "manual_adjustment",
      "supplier_return",
      "sale_adjustment",
      "customer_refund",
      "other",
    ],
    { errorMap: () => ({ message: "Selecciona un motivo" }) }
  ),
  notes: z.string().optional(),
});

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;
