import { useForm } from "@conform-to/react";
import { type LoginData, loginSchema } from "@/validators/login";
import { BarChart3, Loader2, Terminal, User, Lock, EyeOff, Eye, ShieldCheck } from "lucide-preact";
import { getFormProps, getInputProps } from "@conform-to/react";
import { useState } from "preact/hooks";
import { parseWithZod } from "@conform-to/zod/v4";
import { navigate } from "wouter/use-hash-location";
import { useAuthStore } from "@/store/authStore";

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
      clearError(); // Limpiar errores previos

      const satinized = parseWithZod(formData, { schema: loginSchema });
      if (satinized.status === "success") {
        try {
          await login(satinized.payload as LoginData);
          navigate("/"); // Redirigir después del login exitoso
        } catch (error) {
          // El error ya está manejado por el store
          console.error("Error al iniciar sesión:", error);
        }
      }
    },
    defaultValue: {
      username: "",
      password: "",
    },
  });

  const colors = {
    primary: "bg-slate-900",
    primaryText: "text-slate-900",
    secondary: "bg-slate-50",
    secondaryText: "text-slate-500",
    error: "text-red-600",
    errorBg: "bg-red-50",
    errorBorder: "border-red-200",
  };

  return (
    <div
      className={`flex min-h-screen w-full font-sans overflow-hidden ${colors.secondary} text-slate-800`}
    >
      {/* 🟦 COLUMNA IZQUIERDA - FORMULARIO */}
      <div className="w-full lg:w-5/12 xl:w-4/12 flex flex-col justify-center px-8 sm:px-12 md:px-20 bg-white relative z-10 shadow-2xl">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 rounded-lg ${colors.primary}`}>
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${colors.primaryText}`}>
              NEXUS <span className="font-light">POS</span>
            </span>
          </div>

          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${colors.primaryText}`}>
            Bienvenido
          </h1>
          <p className={colors.secondaryText}>Acceda a su terminal de punto de venta.</p>
        </div>

        <form {...getFormProps(form)} className="space-y-5 w-full">
          {error && (
            <div
              className={`p-4 rounded border flex items-start gap-3 ${colors.errorBg} ${colors.errorBorder} animate-shake`}
            >
              <ShieldCheck className={`w-5 h-5 shrink-0 ${colors.error}`} />
              <p className={`text-sm font-medium ${colors.error}`}>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor={fields.username.id} className="text-sm font-semibold text-slate-700">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                {...getInputProps(fields.username, { type: "text" })}
                placeholder="Nombre de usuario"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border focus:bg-white outline-none transition-all ${
                  fields.username.errors
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-slate-900"
                }`}
              />
            </div>
            {fields.username.errors && (
              <p className="text-sm text-red-600 mt-1">{fields.username.errors}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor={fields.password.id} className="text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...getInputProps(fields.password, { type: showPassword ? "text" : "password" })}
                required
                className={`w-full pl-10 pr-12 py-3 bg-slate-50 border focus:bg-white outline-none transition-all ${
                  fields.password.errors
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-slate-900"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fields.password.errors && (
              <p className="text-sm text-red-600 mt-1">{fields.password.errors}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-2 ${colors.primary} text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors disabled:opacity-70`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </form>

        <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between text-[10px] uppercase tracking-widest text-slate-400 font-medium">
          <span>Secure Terminal</span>
          <span>v2.4.0-ENT</span>
        </div>
      </div>

      {/* 🟩 COLUMNA DERECHA - IMAGEN DE FONDO */}
      <div
        className="hidden lg:flex lg:w-7/12 xl:w-8/12 relative bg-slate-900 items-center justify-center p-20"
        style={{
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Capa de superposición para mejorar contraste */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-slate-900/40"></div>

        {/* Contenido sobre la imagen */}
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

          {/* Indicadores visuales inferiores */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-12 text-white/50 text-[11px] font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              Cloud Sync Active
            </div>
            <div className="flex items-center gap-2">Encrypted Session</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
