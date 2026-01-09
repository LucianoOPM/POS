import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";

// Mapeo de rutas a títulos personalizados
const PAGE_TITLES: Record<string, string> = {
  "/": "Punto de Venta",
  "/inventory": "Gestión de Inventario",
  "/clients": "Gestión de Clientes",
  "/reports": "Reportes y Estadísticas",
  "/settings": "Configuración",
};

// Función auxiliar para generar iniciales del usuario
const getUserInitials = (username: string): string => {
  const parts = username.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
};

// Función auxiliar para generar color de fondo basado en el username
const getAvatarColor = (username: string): string => {
  const colors = [
    "bg-indigo-50 text-indigo-600 border-indigo-100",
    "bg-purple-50 text-purple-600 border-purple-100",
    "bg-pink-50 text-pink-600 border-pink-100",
    "bg-blue-50 text-blue-600 border-blue-100",
    "bg-green-50 text-green-600 border-green-100",
    "bg-yellow-50 text-yellow-600 border-yellow-100",
  ];
  const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function Navbar() {
  const [location] = useLocation();
  const { session } = useAuthStore();

  // Obtener título de la página actual
  const pageTitle = PAGE_TITLES[location] || "Dashboard";

  // Información del usuario
  const username = session?.username || "Usuario";
  const userInitials = getUserInitials(username);
  const avatarColor = getAvatarColor(username);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-gray-700 tracking-tight text-lg">
          {pageTitle}
          <span className="text-gray-400 font-normal mx-2">|</span>
          <span className="text-gray-500 font-normal text-sm">Sucursal Centro</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Estado de conexión */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <span
            className={`w-2 h-2 rounded-full ${navigator.onLine ? "bg-green-500" : "bg-red-500"}`}
          ></span>
          {navigator.onLine ? "ONLINE" : "OFFLINE"}
        </div>

        {/* Información del usuario */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${avatarColor}`}
          >
            {userInitials}
          </div>
          <span className="text-sm font-medium text-gray-700">{username}</span>
        </div>
      </div>
    </header>
  );
}
