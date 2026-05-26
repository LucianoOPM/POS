import {
  Building2,
  ShoppingCart,
  Package,
  Receipt,
  Cloud,
} from "lucide-preact";
import type { SettingsCategory, SettingsCategoryInfo } from "@/types";

const CATEGORIES: SettingsCategoryInfo[] = [
  {
    id: "business",
    label: "Informacion del Negocio",
    description: "Datos de la empresa",
    icon: "Building2",
  },
  {
    id: "sales",
    label: "Configuracion de Ventas",
    description: "Impuestos y descuentos",
    icon: "ShoppingCart",
  },
  {
    id: "inventory",
    label: "Inventario",
    description: "Alertas de stock",
    icon: "Package",
  },
  {
    id: "receipt",
    label: "Tickets de Venta",
    description: "Personalizacion de recibos",
    icon: "Receipt",
  },
  {
    id: "erp",
    label: "Integracion ERP",
    description: "Conexion con sistema externo",
    icon: "Cloud",
  },
];

const IconMap = {
  Building2,
  ShoppingCart,
  Package,
  Receipt,
  Cloud,
};

interface Props {
  activeTab: SettingsCategory;
  onTabChange: (tab: SettingsCategory) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 shrink-0">
      <nav className="space-y-1">
        {CATEGORIES.map((category) => {
          const Icon = IconMap[category.icon as keyof typeof IconMap];
          const isActive = activeTab === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onTabChange(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700 border border-primary-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-primary-600" : "text-gray-400"}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium text-sm ${isActive ? "text-primary-700" : ""}`}
                >
                  {category.label}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {category.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
