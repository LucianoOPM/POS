import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "preact/hooks";
import { AlertTriangle } from "lucide-preact";
import { useAuthStore } from "@/store/authStore";
import { useLowStock } from "@/hooks/useLowStock";

const PAGE_TITLES: Record<string, string> = {
  "/": "Punto de Venta",
  "/inventory": "Gestión de Inventario",
  "/clients": "Gestión de Clientes",
  "/reports": "Reportes y Estadísticas",
  "/settings": "Configuración",
};

const getUserInitials = (username: string): string => {
  const parts = username.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
};

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

  const pageTitle = PAGE_TITLES[location] || "Dashboard";
  const username = session?.username || "Usuario";
  const userInitials = getUserInitials(username);
  const avatarColor = getAvatarColor(username);

  const { lowStockCount, lowStockItems } = useLowStock();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

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

        {/* Badge de stock bajo */}
        {lowStockCount > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle size={13} />
              <span>{lowStockCount} stock bajo</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <AlertTriangle size={15} className="text-amber-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {lowStockCount} producto(s) con stock bajo
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Producto</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Mín.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item) => (
                        <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-700 font-medium truncate max-w-36">{item.name}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`font-bold ${item.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                              {item.stock}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-400">{item.threshold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

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
