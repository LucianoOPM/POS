import { z } from "zod";

export const loginFormSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }),
  remember: z.coerce.boolean(),
});

export type LoginForm = z.infer<typeof loginFormSchema>;
