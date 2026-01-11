import { useState } from "preact/hooks";
import useSWR from "swr";
import { useLocation } from "wouter";
import { ArrowLeft, Package, RefreshCw } from "lucide-preact";
import { reportsActions, type ProductReportResult, type ProductReportParams } from "@/actions/reports";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

const formatPercentage = (value: string) => {
  const num = parseFloat(value);
  return `${num.toFixed(2)}%`;
};

const getDefaultDateRange = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    date_from: firstDayOfMonth.toISOString().split("T")[0],
    date_to: today.toISOString().split("T")[0],
  };
};

export default function ProductReport() {
  const [, navigate] = useLocation();
  const defaultRange = getDefaultDateRange();
  const [params, setParams] = useState<ProductReportParams>(defaultRange);

  const { data, isLoading, error, mutate } = useSWR<ProductReportResult>(
    ["product-report", params],
    () => reportsActions.getProductReport(params)
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
              <h1 className="text-xl font-semibold text-foreground">Reporte por Producto</h1>
              <p className="text-sm text-muted-foreground">Detalle de productos vendidos y reembolsados</p>
            </div>
          </div>

          {/* Filters */}
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
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar el reporte</h3>
            <p className="text-sm text-muted-foreground">{String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Cantidad Vendida</p>
                <p className="text-xl font-bold text-foreground">{data.total_quantity_sold}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Cantidad Reembolsada</p>
                <p className="text-xl font-bold text-red-500">{data.total_quantity_refunded}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Cantidad Neta</p>
                <p className="text-xl font-bold text-foreground">{data.total_net_quantity}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Ingreso Bruto</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(data.total_gross_revenue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Ingreso Neto</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(data.total_net_revenue)}</p>
              </div>
            </div>

            {/* Data table */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Detalle por Producto</h2>
              </div>
              {data.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos para el periodo seleccionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Vendido</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Reembolsado</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Neto</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Ingreso Bruto</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Ingreso Neto</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">% Part.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.items.map((item) => (
                        <tr key={item.product_id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{item.category_name || "Sin categoria"}</td>
                          <td className="px-4 py-3 text-sm text-right text-foreground">{item.quantity_sold}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-500">{item.quantity_refunded}</td>
                          <td className="px-4 py-3 text-sm text-right text-foreground">{item.net_quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-foreground">{formatCurrency(item.gross_revenue)}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(item.net_revenue)}</td>
                          <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatPercentage(item.share_percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
