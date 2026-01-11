import { useState } from "preact/hooks";
import useSWR from "swr";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, RefreshCw, Calendar } from "lucide-preact";
import { reportsActions, type SalesOverTimeResult, type SalesOverTimeParams, type TimeGrouping } from "@/actions/reports";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

const getDefaultDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    date_from: thirtyDaysAgo.toISOString().split("T")[0],
    date_to: today.toISOString().split("T")[0],
  };
};

export default function SalesOverTimeReport() {
  const [, navigate] = useLocation();
  const defaultRange = getDefaultDateRange();
  const [params, setParams] = useState<SalesOverTimeParams>({
    ...defaultRange,
    grouping: "day" as TimeGrouping,
  });

  const { data, isLoading, error, mutate } = useSWR<SalesOverTimeResult>(
    ["sales-over-time-report", params],
    () => reportsActions.getSalesOverTime(params)
  );

  const handleDateChange = (field: "date_from" | "date_to", value: string) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupingChange = (grouping: TimeGrouping) => {
    setParams((prev) => ({ ...prev, grouping }));
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
              <h1 className="text-xl font-semibold text-foreground">Ventas en el Tiempo</h1>
              <p className="text-sm text-muted-foreground">Tendencias y estacionalidad de ventas</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={params.grouping}
              onChange={(e) => handleGroupingChange((e.target as HTMLSelectElement).value as TimeGrouping)}
              className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="day">Por Dia</option>
              <option value="week">Por Semana</option>
              <option value="month">Por Mes</option>
            </select>
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
              <TrendingUp className="w-8 h-8 text-red-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-1">Ventas Netas Totales</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(data.total_net_sales)}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-1">Total de Ventas</p>
                <p className="text-2xl font-bold text-foreground">{data.total_sales_count}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-6">
                <p className="text-sm text-muted-foreground mb-1">Ticket Promedio</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(data.total_average_ticket)}</p>
              </div>
            </div>

            {/* Data table */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Detalle por Periodo</h2>
              </div>
              {data.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay datos para el periodo seleccionado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Periodo</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Ventas Netas</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">No. Ventas</th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Ticket Promedio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.items.map((item, index) => (
                        <tr key={index} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{item.period}</td>
                          <td className="px-6 py-4 text-sm text-right text-foreground">{formatCurrency(item.net_sales)}</td>
                          <td className="px-6 py-4 text-sm text-right text-foreground">{item.sales_count}</td>
                          <td className="px-6 py-4 text-sm text-right text-foreground">{formatCurrency(item.average_ticket)}</td>
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
