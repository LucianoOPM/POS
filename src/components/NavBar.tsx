import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "wouter-preact";
import { navigate } from "wouter-preact/use-hash-location";

const appModules = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Users", path: "/users" },
];

export const NavBar = () => {
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <nav class="bg-white border-gray-200 dark:bg-gray-900">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to="/dashboard"
          class="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            class="h-8"
            alt="Flowbite Logo"
          />
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-primary-500">
            Mi Empresa
          </span>
        </Link>
        <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            onClick={handleLogout}
            type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 hover:cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            Log out
          </button>
        </div>
        <div
          class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
          id="navbar-cta"
        >
          <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {appModules.map(({ name, path }) => {
              const baseStyle =
                "block py-2 px-3 md:p-0 text-white bg-primary-600 rounded-sm md:bg-transparent md:text-primary-600 md:dark:text-primary-500 hover:text-primary-700";
              const activeStyle = "underline";
              return (
                <li key={name}>
                  <Link
                    to={path}
                    className={(active) =>
                      [baseStyle, active ? activeStyle : ""].join(" ")
                    }
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};
