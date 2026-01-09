import { useState, useEffect } from "preact/hooks";
import { useAuthStore } from "@/store/authStore";
import { PERMISSIONS } from "@/types/permissions";
import ReportsStats from "./components/ReportsStats";
import ReportsToolbar from "./components/ReportsToolbar";
import ReportsTabs from "./components/ReportsTabs";
import SalesReport from "./components/SalesReport";
import ProductMovementReport from "./components/ProductMovementReport";
import FinancialReport from "./components/FinancialReport";
import type { DateRange, ReportType, ExportFormat } from "@/types";
import { MOCK_SALES_SUMMARY } from "@/mocks/reports";

function getInitialDateRange(): DateRange {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  return { startDate: start, endDate: end };
}

function getDefaultTab(hasPermission: (p: string) => boolean): ReportType {
  if (hasPermission(PERMISSIONS.REPORTS_SALES)) return "sales";
  if (hasPermission(PERMISSIONS.REPORTS_INVENTORY)) return "products";
  if (hasPermission(PERMISSIONS.REPORTS_FINANCIAL)) return "financial";
  return "sales";
}

export default function Reports() {
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ReportType>(() => getDefaultTab(hasPermission));
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange);

  // Asegurarse de que el tab activo sea uno que el usuario puede ver
  useEffect(() => {
    if (activeTab === "sales" && !hasPermission(PERMISSIONS.REPORTS_SALES)) {
      setActiveTab(getDefaultTab(hasPermission));
    } else if (activeTab === "products" && !hasPermission(PERMISSIONS.REPORTS_INVENTORY)) {
      setActiveTab(getDefaultTab(hasPermission));
    } else if (activeTab === "financial" && !hasPermission(PERMISSIONS.REPORTS_FINANCIAL)) {
      setActiveTab(getDefaultTab(hasPermission));
    }
  }, [activeTab, hasPermission]);

  const handleExport = (format: ExportFormat) => {
    // Funcionalidad pendiente
    console.log(`Exportar a ${format} - Proximamente`);
  };

  // Datos del resumen (mock por ahora)
  const summary = MOCK_SALES_SUMMARY;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Stats Header */}
      <ReportsStats
        totalSales={summary.totalSales}
        totalRevenue={summary.totalRevenue}
        totalProfit={summary.totalProfit}
        averageTicket={summary.averageTicket}
      />

      {/* Toolbar */}
      <ReportsToolbar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
      />

      {/* Tabs */}
      <ReportsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenido del reporte */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        {activeTab === "sales" && <SalesReport />}
        {activeTab === "products" && <ProductMovementReport />}
        {activeTab === "financial" && <FinancialReport />}
      </div>
    </div>
  );
}
