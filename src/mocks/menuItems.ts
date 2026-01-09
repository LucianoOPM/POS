import { BarChart3, Package, Settings, ShoppingCart, Users } from "lucide-preact";
import { PERMISSIONS } from "@/types/permissions";

export interface MenuItem {
  id: string;
  icon: typeof ShoppingCart;
  label: string;
  /** Permiso requerido para ver este item */
  permission?: string;
  /** Permisos requeridos (al menos uno) */
  anyOfPermissions?: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "pos",
    icon: ShoppingCart,
    label: "Ventas",
    permission: PERMISSIONS.SALES_CREATE,
  },
  {
    id: "inventory",
    icon: Package,
    label: "Productos",
    permission: PERMISSIONS.PRODUCTS_VIEW,
  },
  {
    id: "clients",
    icon: Users,
    label: "Clientes",
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Reportes",
    anyOfPermissions: [
      PERMISSIONS.REPORTS_SALES,
      PERMISSIONS.REPORTS_INVENTORY,
      PERMISSIONS.REPORTS_FINANCIAL,
    ],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Config",
    permission: PERMISSIONS.PROFILES_MANAGE,
  },
];
