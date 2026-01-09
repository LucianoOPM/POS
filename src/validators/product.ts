import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().nonempty().nonoptional(),
  code: z.string().nonempty().nonoptional(),
  stock: z.coerce.number().nonnegative(),
  category_id: z.number().optional(),
  price: z.coerce.number().nonnegative().nonoptional(),
  cost: z.coerce.number().nonnegative().nonoptional(),
  tax: z.coerce.number().nonnegative().nonoptional(),
  createdBy: z.string().nonempty().optional(),
  updatedBy: z.string().nonempty().optional(),
});

export type ProductForm = z.infer<typeof productFormSchema>;
