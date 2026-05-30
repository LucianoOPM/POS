import {
  Archive,
  BanknoteArrowUp,
  BarChart3,
  History,
  Package,
  Printer,
  Settings,
  ShieldUser,
  ShoppingCart,
  Users,
} from "lucide-preact";
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
    id: "shifts",
    icon: History,
    label: "Turnos",
    permission: PERMISSIONS.SHIFTS_VIEW,
  },
  {
    id: "refunds",
    icon: BanknoteArrowUp,
    label: "Reembolsos",
    permission: PERMISSIONS.SALES_REFUND,
  },
  {
    id: "users",
    icon: ShieldUser,
    label: "Usuarios",
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    id: "products",
    icon: Package,
    label: "Productos",
    permission: PERMISSIONS.PRODUCTS_VIEW,
  },
  {
    id: "inventory",
    icon: Archive,
    label: "Inventario",
    permission: PERMISSIONS.PRODUCTS_VIEW,
  },
  {
    id: "clients",
    icon: Users,
    label: "Clientes",
    permission: PERMISSIONS.CUSTOMERS_VIEW,
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
    id: "printing",
    icon: Printer,
    label: "Impresión",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    id: "settings",
    icon: Settings,
    label: "Config",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];
