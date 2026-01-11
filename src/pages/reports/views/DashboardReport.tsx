import { useState } from "preact/hooks";
import useSWR from "swr";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Package, RefreshCw, type LucideIcon } from "lucide-preact";
import { reportsActions, type DashboardResult, type DashboardParams } from "@/actions/reports";

// Helpers
const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

const getDefaultDateRange = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    date_from: firstDayOfMonth.toISOString().split("T")[0],
    date_to: today.toISOString().split("T")[0],
  };
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" color={color} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardReport() {
  const [, navigate] = useLocation();
  const defaultRange = getDefaultDateRange();
  const [params, setParams] = useState<DashboardParams>(defaultRange);

  const { data, isLoading, error, mutate } = useSWR<DashboardResult>(
    ["dashboard-report", params],
    () => reportsActions.getDashboard(params)
  );

  const handleDateChange = (field: "date_from" | "date_to", value: string) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/reports")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Dashboard Ejecutivo</h1>
              <p className="text-sm text-muted-foreground">Vista resumida del estado del negocio</p>
            </div>
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Desde:</label>
              <input
                type="date"
                value={params.date_from}
                onChange={(e) => handleDateChange("date_from", (e.target as HTMLInputElement).value)}
                className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Hasta:</label>
              <input
                type="date"
                value={params.date_to}
                onChange={(e) => handleDateChange("date_to", (e.target as HTMLInputElement).value)}
                className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => mutate()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-red-100 rounded-full mb-4">
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar el reporte</h3>
            <p className="text-sm text-muted-foreground">{String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Main stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Ventas Brutas"
                value={formatCurrency(data.gross_sales)}
                icon={DollarSign}
                color="#22c55e"
              />
              <StatCard
                title="Total Reembolsado"
                value={formatCurrency(data.total_refunded)}
                icon={TrendingDown}
                color="#ef4444"
              />
              <StatCard
                title="Ventas Netas"
                value={formatCurrency(data.net_sales)}
                icon={TrendingUp}
                color="#3b82f6"
              />
              <StatCard
                title="Numero de Ventas"
                value={data.sales_count.toString()}
                icon={ShoppingCart}
                color="#8b5cf6"
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Ticket Promedio"
                value={formatCurrency(data.average_ticket)}
                icon={DollarSign}
                color="#f59e0b"
              />
              <StatCard
                title="Metodo de Pago Dominante"
                value={data.dominant_payment_method || "Sin datos"}
                subtitle={data.dominant_payment_method ? formatCurrency(data.dominant_payment_amount) : undefined}
                icon={CreditCard}
                color="#22c55e"
              />
              <StatCard
                title="Producto Mas Vendido"
                value={data.top_product || "Sin datos"}
                subtitle={data.top_product ? `${data.top_product_quantity} unidades` : undefined}
                icon={Package}
                color="#6366f1"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
