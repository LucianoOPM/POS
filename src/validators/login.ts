import { z } from "zod";
import { PASSWORD_REGEXP } from "@/constants";

export const loginSchema = z.object({
  username: z.string({ error: "El usuario es requerido" }).min(1, "El usuario es requerido"),
  password: z
    .string({ error: "La contraseña es requerida" })
    .min(1, "La contraseña es requerida")
    .regex(
      PASSWORD_REGEXP,
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
    ),
});

export type LoginData = z.infer<typeof loginSchema>;
