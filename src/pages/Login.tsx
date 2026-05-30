import { useForm } from "@conform-to/react";
import { type LoginData, loginSchema } from "@/validators/login";
import { BarChart3, Loader2, Terminal, User, Lock, EyeOff, Eye, ShieldCheck } from "lucide-preact";
import { getFormProps, getInputProps } from "@conform-to/react";
import { useState } from "preact/hooks";
import { parseWithZod } from "@conform-to/zod/v4";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Login() {
  const bgImageUrl = "";
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, fields] = useForm<LoginData>({
    shouldValidate: "onBlur",
    shouldRevalidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: loginSchema });
    },
    onSubmit: async (e, { formData }) => {
      e.preventDefault();
      clearError();

      const satinized = parseWithZod(formData, { schema: loginSchema });
      if (satinized.status === "success") {
        try {
          await login(satinized.payload as LoginData);
        } catch (error) {
          console.error("Error al iniciar sesión:", error);
        }
      }
    },
    defaultValue: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden bg-slate-50 text-slate-800">
      {/* Columna izquierda - Formulario */}
      <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col justify-center px-8 sm:px-12 md:px-20 bg-white relative z-10 shadow-2xl">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-lg bg-slate-900">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              NEXUS <span className="font-light">POS</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">
            Bienvenido
          </h1>
          <p className="text-slate-500">Acceda a su terminal de punto de venta.</p>
        </div>

        <form {...getFormProps(form)} className="space-y-5 w-full">
          {error && (
            <div className="p-4 rounded border flex items-start gap-3 bg-red-50 border-red-200 animate-shake">
              <ShieldCheck className="w-5 h-5 shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor={fields.username.id} className="text-slate-700">
              Usuario
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                required
                {...getInputProps(fields.username, { type: "text" })}
                placeholder="Nombre de usuario"
                className="pl-9 rounded-none h-11"
              />
            </div>
            {fields.username.errors && (
              <p className="text-sm text-red-600 mt-1">{fields.username.errors}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={fields.password.id} className="text-slate-700">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                {...getInputProps(fields.password, { type: showPassword ? "text" : "password" })}
                required
                placeholder="••••••••"
                className="pl-9 pr-10 rounded-none h-11"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {fields.password.errors && (
              <p className="text-sm text-red-600 mt-1">{fields.password.errors}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full mt-2 rounded-none uppercase tracking-widest text-xs"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Ingresar al Sistema"
            )}
          </Button>
        </form>

        <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between text-[10px] uppercase tracking-widest text-slate-400 font-medium">
          <span>Secure Terminal</span>
          <span>v2.4.0-ENT</span>
        </div>
      </div>

      {/* Columna derecha - Panel decorativo */}
      <div
        className="hidden lg:flex lg:w-7/12 xl:w-8/12 relative bg-slate-900 items-center justify-center p-20"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-slate-900/40"></div>

        <div className="relative z-10 max-w-2xl text-center">
          <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            La potencia de un ERP en su punto de venta.
          </h2>
          <p className="text-lg text-slate-200 font-light leading-relaxed">
            Optimice sus operaciones comerciales con herramientas diseñadas para el crecimiento y la
            estabilidad de su empresa.
          </p>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-12 text-white/50 text-[11px] font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              Cloud Sync Active
            </div>
            <div className="flex items-center gap-2">Encrypted Session</div>
          </div>
        </div>
      </div>

    </div>
  );
}
