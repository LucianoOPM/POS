import { useAuthStore } from "@/stores/useAuthStore";
import { useForm } from "react-hook-form";
import {
  LoginForm as LoginFormSchema,
  loginFormSchema,
} from "@/auth/zod/form.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOffIcon } from "lucide-preact";
import { useState } from "preact/hooks";
import { loginFunction } from "@/auth/hooks/useAuth";
import { navigate } from "wouter-preact/use-hash-location";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const handleLogin = async (data: LoginFormSchema) => {
    const { username, password } = data;
    const sessionData = await loginFunction({ username, password });
    await login(sessionData);
    navigate("/dashboard");
  };
  return (
    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
      <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white select-none">
        Inicia sesión en tu cuenta
      </h1>
      <form
        class="space-y-4 md:space-y-6"
        autoComplete="off"
        onSubmit={handleSubmit(handleLogin)}
      >
        <div>
          <label
            for="username"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Nombre de usuario<span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="username"
            class={`border rounded-lg w-full p-2.5 border-primary-300 placeholder:text-gray-400 text-white ${
              errors.username ? "border-red-500" : ""
            }`}
            autocomplete="off"
            placeholder="username"
            required
            {...register("username")}
          />
          {errors.username && (
            <span class="text-red-500 mt-5 text-sm select-none">
              {errors.username.message}
            </span>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              autocomplete="off"
              class={`border rounded-lg w-full p-2.5 border-primary-300 placeholder:text-gray-400 text-white ${
                errors.password ? "border-red-500" : ""
              }`}
              id="password"
              required
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPassword ? (
                <Eye
                  class="text-white w-6 h-6 hover:cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <EyeOffIcon
                  class="text-white w-6 h-6 hover:cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
          </div>
          {errors.password && (
            <span class="text-red-500 mt-5 text-sm select-none">
              {errors.password.message}
            </span>
          )}
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="remember"
                aria-describedby="remember"
                type="checkbox"
                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                {...register("remember")}
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="remember" class="text-gray-500 dark:text-gray-300">
                Mantener conectado
              </label>
            </div>
          </div>
        </div>
        <button
          type="submit"
          class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
          Sign in
        </button>
      </form>
    </div>
  );
};

/*
<div class="relative">
        <label
          for="password"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Constraseña<span class="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          placeholder="••••••••"
          class={`border rounded-lg w-full p-2.5 border-primary-300 placeholder:text-gray-400 text-white  ${
            errors.password ? "border-red-500" : ""
          }`}
          required
          {...register("password")}
        />
        <div>
          <Eye />
        </div>
        {errors.password && (
          <span class="text-red-500">{errors.password.message}</span>
        )}
      </div>
*/
