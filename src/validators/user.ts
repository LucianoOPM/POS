import { z } from "zod";

export const userFormSchema = z
  .object({
    username: z
      .string()
      .min(3, "El usuario debe tener al menos 3 caracteres")
      .max(50, "El usuario no puede exceder 50 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guion bajo"),
    email: z.string().email("Ingresa un email válido"),
    first_name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    last_name: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(100, "El apellido no puede exceder 100 caracteres"),
    profile_id: z.coerce.number().positive("Selecciona un rol válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .optional()
      .or(z.literal("")),
    confirm_password: z.string().optional().or(z.literal("")),
    is_editing: z.coerce.boolean().optional(),
  })
  .refine(
    (data) => {
      // Si es nuevo usuario (no editing), password es requerido
      if (!data.is_editing && (!data.password || data.password.length < 6)) {
        return false;
      }
      return true;
    },
    {
      message: "La contraseña es requerida para nuevos usuarios",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      // Si hay password, debe coincidir con confirm_password
      if (data.password && data.password !== data.confirm_password) {
        return false;
      }
      return true;
    },
    {
      message: "Las contraseñas no coinciden",
      path: ["confirm_password"],
    }
  );

export type UserFormData = z.infer<typeof userFormSchema>;
