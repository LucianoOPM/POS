import { useAuthStore } from "@/stores/useAuthStore";
import { Link, useLocation } from "wouter-preact";
import { navigate } from "wouter-preact/use-hash-location";

const appModules = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Products", path: "/products" },
];

export const NavBar = () => {
  const logout = useAuthStore((state) => state.logout);
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav class="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 shadow-sm">
      <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo & Title */}
        <Link to="/dashboard" class="flex items-center gap-3">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            alt="Logo"
            class="h-8 w-auto"
          />
          <span class="text-xl font-bold text-primary-500">Mi Empresa</span>
        </Link>

        {/* Navigation Links */}
        <ul class="hidden md:flex gap-6 items-center text-sm font-medium">
          {appModules.map(({ name, path }) => {
            const isActive = location === path;
            const baseClasses =
              "px-3 py-2 rounded-md transition-colors duration-200 text-primary-600 hover:text-primary-800";
            const activeClasses = "text-primary-700 underline";

            return (
              <li key={name}>
                <Link
                  to={path}
                  class={`${baseClasses} ${isActive ? activeClasses : ""}`}
                >
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <button
          onClick={handleLogout}
          class="ml-4 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-md dark:bg-primary-600 dark:hover:bg-primary-700 hover:cursor-pointer"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};
