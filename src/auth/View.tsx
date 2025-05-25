import { LoginForm } from "@auth/components/LoginForm";
export const AuthView = () => {
  return (
    <section class="bg-gray-50 dark:bg-gray-900">
      <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div class="absolute top-0 left-0 right-0 z-10 flex h-48 w-full items-center justify-center bg-gradient-to-b from-primary-500 to-gray-900">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white select-none">
            Terminal de punto de venta
          </h1>
        </div>
        <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <LoginForm />
        </div>
        <div class="absolute bottom-0 left-0 right-0 z-10 flex h-48 w-full items-center justify-center bg-gradient-to-b from-gray-900 to-primary-500"></div>
      </div>
    </section>
  );
};
