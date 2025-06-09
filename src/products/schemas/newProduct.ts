import { z } from "zod";

export const newProductSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(20, { message: "Name must be at most 20 characters long" }),
  stock: z.coerce.number(),
  maxStock: z.coerce.number(),
  isActive: z.boolean(),
  price: z.coerce
    .number({ message: "Price is required" })
    .min(0, { message: "Price must be at least 0 dollars" }),
  barcode: z
    .string({ message: "Barcode is required" })
    .min(3, { message: "Barcode must be at least 3 characters long" })
    .max(20, { message: "Barcode must be at most 20 characters long" }),
  description: z
    .string({ message: "Description is required" })
    .min(3, { message: "Description must be at least 3 characters long" }),
});
export type NewProduct = z.infer<typeof newProductSchema>;
