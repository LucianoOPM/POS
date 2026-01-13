import { useForm, getFormProps, getInputProps, getSelectProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { Save, X, Eye, EyeOff } from "lucide-preact";
import useSWR from "swr";
import { JSX } from "preact/jsx-runtime";
import { useState } from "preact/hooks";
import { useAuthStore } from "@/store/authStore";
import { userActions } from "@/actions/users";
import { type UserFormData, userFormSchema } from "@/validators/user";
import type { UserRecord, Profile } from "@/types";

interface Props {
  user?: UserRecord;
  setShowUserModal: (value: boolean) => void;
  onSuccess?: () => void;
}

export default function UserForm({ user, setShowUserModal, onSuccess }: Props) {
  const { session } = useAuthStore();
  const {
    data: profiles,
    error: profilesError,
    isLoading: profilesLoading,
  } = useSWR<Profile[]>("profiles", () => userActions.getProfiles());

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditing = !!user;

  const [form, fields] = useForm<UserFormData>({
    defaultValue: {
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      profile_id: user?.profile_id || "",
      password: "",
      confirm_password: "",
      is_editing: isEditing,
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: userFormSchema });
    },
    async onSubmit(event, context) {
      event.preventDefault();

      if (!context.submission || context.submission.status !== "success") {
        return;
      }

      const formData = context.submission.value;
      setIsSaving(true);
      setSaveError(null);

      try {
        if (user) {
          // Actualizar usuario existente
          await userActions.updateUser(user.id, {
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            profile_id: formData.profile_id,
            password: formData.password || undefined,
            updated_by: session?.user_id || "",
          });
        } else {
          // Crear nuevo usuario
          await userActions.createUser({
            username: formData.username,
            email: formData.email,
            password: formData.password || "",
            first_name: formData.first_name,
            last_name: formData.last_name,
            profile_id: formData.profile_id,
            created_by: session?.user_id || "",
          });
        }

        onSuccess?.();
        form.reset();
        setShowUserModal(false);
      } catch (error) {
        console.error("Error al guardar usuario:", error);
        setSaveError(
          typeof error === "string" ? error : "Error al guardar el usuario. Intenta nuevamente."
        );
      } finally {
        setIsSaving(false);
      }
    },
  });

  const handleCancel = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.reset();
    setShowUserModal(false);
  };

  const formProps = getFormProps(form);

  return (
    <>
      {/* Header del modal */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg text-gray-800">
          {user ? "Editar Usuario" : "Nuevo Usuario"}
        </h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Formulario */}
      <form
        {...formProps}
        className="p-6 space-y-4 overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          formProps.onSubmit?.(e as any);
        }}
      >
        {/* Campo oculto para indicar si es edición */}
        <input type="hidden" name="is_editing" value={isEditing ? "true" : "false"} />

        {/* Error general del formulario */}
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
            <input
              {...getInputProps(fields.first_name, { type: "text" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Ej. Juan"
            />
            {fields.first_name.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.first_name.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Apellido</label>
            <input
              {...getInputProps(fields.last_name, { type: "text" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Ej. Perez"
            />
            {fields.last_name.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.last_name.errors}</p>
            )}
          </div>
        </div>

        {/* Usuario y Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Usuario</label>
            <input
              {...getInputProps(fields.username, { type: "text" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Ej. jperez"
            />
            {fields.username.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.username.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input
              {...getInputProps(fields.email, { type: "email" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Ej. juan@empresa.com"
            />
            {fields.email.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.email.errors}</p>
            )}
          </div>
        </div>

        {/* Rol */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
          <select
            {...(getSelectProps(fields.profile_id) as any)}
            className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none bg-white disabled:bg-gray-100"
            disabled={profilesLoading}
          >
            <option value="">Seleccionar rol...</option>
            {profilesLoading && <option value="">Cargando roles...</option>}
            {profilesError && <option value="">Error al cargar roles</option>}
            {profiles?.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
          {profilesError && <p className="text-xs text-red-500 mt-1">Error al cargar los roles</p>}
          {fields.profile_id.errors && (
            <p className="text-xs text-red-500 mt-1">{fields.profile_id.errors}</p>
          )}
        </div>

        {/* Contraseñas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Contraseña
              {isEditing && (
                <span className="text-gray-400 font-normal ml-1 text-[10px]">
                  (dejar vacío para no cambiar)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                {...getInputProps(fields.password, { type: showPassword ? "text" : "password" })}
                className="w-full p-2 pr-10 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder={isEditing ? "Nueva contraseña" : "Contraseña"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fields.password.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.password.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Confirmar Contraseña</label>
            <div className="relative">
              <input
                {...getInputProps(fields.confirm_password, {
                  type: showConfirmPassword ? "text" : "password",
                })}
                className="w-full p-2 pr-10 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Repetir contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fields.confirm_password.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.confirm_password.errors}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">...</span> Guardando...
              </>
            ) : (
              <>
                <Save size={18} /> {user ? "Actualizar" : "Crear Usuario"}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
