import { LogOut } from "lucide-preact";
import NavItem from "./NavItem";
import { MENU_ITEMS, MenuItem } from "@/mocks/menuItems";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";

// Mapeo de IDs de menú a rutas
const ROUTE_MAP: Record<string, string> = {
  pos: "/",
  refunds: "/refunds",
  inventory: "/inventory",
  clients: "/clients",
  users: "/users",
  reports: "/reports",
  settings: "/settings",
};

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { logout, hasPermission, hasAnyPermission } = useAuthStore();

  // Filtrar items de menú basado en permisos
  const filteredMenuItems = MENU_ITEMS.filter((item: MenuItem) => {
    if (item.permission) {
      return hasPermission(item.permission);
    }
    if (item.anyOfPermissions) {
      return hasAnyPermission(item.anyOfPermissions);
    }
    return true; // Si no tiene restricción de permiso, mostrar siempre
  });

  // Determinar el módulo activo basado en la ruta actual
  const getActiveModule = () => {
    // Para la ruta raíz, solo coincide exactamente
    if (location === "/") return "pos";

    // Para otras rutas, buscar la que coincida como prefijo
    const activeEntry = Object.entries(ROUTE_MAP).find(
      ([_, route]) => route !== "/" && location.startsWith(route)
    );
    return activeEntry ? activeEntry[0] : "pos";
  };

  const handleNavigation = (id: string) => {
    const route = ROUTE_MAP[id];
    if (route) {
      setLocation(route);
    }
  };

  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();
    await logout();
    setLocation("/login");
  };

  return (
    <nav className="w-20 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-sm z-30 overflow-hidden">
      <div className="bg-primary-500 text-white p-2 rounded-lg font-bold text-xl mb-8 flex items-center justify-center w-10 h-10 shadow-md shadow-primary-500/20 shrink-0">
        P
      </div>

      <div className="flex-1 flex flex-col w-full items-center gap-2 overflow-y-auto overflow-x-hidden">
        {filteredMenuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={getActiveModule() === item.id}
            onClick={handleNavigation}
          />
        ))}
      </div>

      <button
        className="text-secondary-600 hover:text-error hover:bg-error/10 p-3 rounded-xl transition-all duration-200 shrink-0 hover:cursor-pointer"
        title="Cerrar Sesión"
        onClick={handleLogout}
      >
        <LogOut size={22} />
      </button>
    </nav>
  );
}
