import { useState } from "preact/hooks";
import useSWR from "swr";
import { TrendingUp, Calendar } from "lucide-preact";
import { reportsActions, type SalesOverTimeResult, type SalesOverTimeParams, type TimeGrouping } from "@/actions/reports";
import { useReportDateRange } from "@/hooks/useReportDateRange";
import ReportPageLayout from "../components/ReportPageLayout";
import DateRangeFilter from "../components/DateRangeFilter";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

export default function SalesOverTimeReport() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useReportDateRange("last-30-days");
  const [grouping, setGrouping] = useState<TimeGrouping>("day");

  const params: SalesOverTimeParams = { date_from: dateFrom, date_to: dateTo, grouping };

  const { data, isLoading, error, mutate } = useSWR<SalesOverTimeResult>(
    ["sales-over-time-report", params],
    () => reportsActions.getSalesOverTime(params)
  );

  return (
    <ReportPageLayout
      title="Ventas en el Tiempo"
      description="Tendencias y estacionalidad de ventas"
      filters={
        <>
          <select
            value={grouping}
            onChange={(e) => setGrouping((e.target as HTMLSelectElement).value as TimeGrouping)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="day">Por Dia</option>
            <option value="week">Por Semana</option>
            <option value="month">Por Mes</option>
          </select>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onRefresh={() => mutate()}
            isRefreshing={isLoading}
          />
        </>
      }
    >
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
    </ReportPageLayout>
  );
}
