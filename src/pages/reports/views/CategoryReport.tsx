import { useState } from "preact/hooks";
import useSWR from "swr";
import { useLocation } from "wouter";
import { ArrowLeft, FolderTree, RefreshCw } from "lucide-preact";
import {
  reportsActions,
  type CategoryReportResult,
  type CategoryReportParams,
} from "@/actions/reports";

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

export default function CategoryReport() {
  const [, navigate] = useLocation();
  const defaultRange = getDefaultDateRange();
  const [params, setParams] = useState<CategoryReportParams>(defaultRange);

  const { data, isLoading, error, mutate } = useSWR<CategoryReportResult>(
    ["category-report", params],
    () => reportsActions.getCategoryReport(params)
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
              <h1 className="text-xl font-semibold text-foreground">Reporte por Categoria</h1>
              <p className="text-sm text-muted-foreground">
                Analisis de desempeño por linea de producto
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Desde:</label>
              <input
                type="date"
                value={params.date_from}
                onChange={(e) =>
                  handleDateChange("date_from", (e.target as HTMLInputElement).value)
                }
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
              <FolderTree className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar el reporte</h3>
            <p className="text-sm text-muted-foreground">{String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-1">Ventas Netas Totales</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(data.total_net_sales)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-1">Cantidad Vendida Total</p>
                <p className="text-2xl font-bold text-foreground">{data.total_quantity_sold}</p>
              </div>
            </div>

            {/* Data table */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Detalle por Categoria</h2>
              </div>
              {data.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderTree className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos para el periodo seleccionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                          Ventas Netas
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                          Cantidad Vendida
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                          % Participacion
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                          Distribucion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.items.map((item, index) => (
                        <tr
                          key={item.category_id ?? index}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            {item.category_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-foreground">
                            {formatCurrency(item.net_sales)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-foreground">
                            {item.quantity_sold}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-foreground">
                            {formatPercentage(item.share_percentage)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(parseFloat(item.share_percentage), 100)}%`,
                                }}
                              />
                            </div>
                          </td>
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
