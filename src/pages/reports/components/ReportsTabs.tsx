import { ShoppingCart, Package, DollarSign } from "lucide-preact";
import { useAuthStore } from "@/store/authStore";
import { PERMISSIONS } from "@/types/permissions";
import type { ReportType } from "@/types";

interface ReportsTabsProps {
  activeTab: ReportType;
  onTabChange: (tab: ReportType) => void;
}

interface TabConfig {
  id: ReportType;
  label: string;
  icon: typeof ShoppingCart;
  permission: string;
}

const TABS: TabConfig[] = [
  {
    id: "sales",
    label: "Ventas",
    icon: ShoppingCart,
    permission: PERMISSIONS.REPORTS_SALES,
  },
  {
    id: "products",
    label: "Movimiento de Productos",
    icon: Package,
    permission: PERMISSIONS.REPORTS_INVENTORY,
  },
  {
    id: "financial",
    label: "Financiero",
    icon: DollarSign,
    permission: PERMISSIONS.REPORTS_FINANCIAL,
  },
];

export default function ReportsTabs({ activeTab, onTabChange }: ReportsTabsProps) {
  const { hasPermission } = useAuthStore();

  const visibleTabs = TABS.filter((tab) => hasPermission(tab.permission));

  return (
    <div className="border-b border-gray-200 px-6">
      <nav className="flex gap-6">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
