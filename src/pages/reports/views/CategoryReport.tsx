import useSWR from "swr";
import { FolderTree } from "lucide-preact";
import { reportsActions, type CategoryReportResult, type CategoryReportParams } from "@/actions/reports";
import { useReportDateRange } from "@/hooks/useReportDateRange";
import ReportPageLayout from "../components/ReportPageLayout";
import DateRangeFilter from "../components/DateRangeFilter";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

const formatPercentage = (value: string) => `${parseFloat(value).toFixed(2)}%`;

export default function CategoryReport() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useReportDateRange("current-month");
  const params: CategoryReportParams = { date_from: dateFrom, date_to: dateTo };

  const { data, isLoading, error, mutate } = useSWR<CategoryReportResult>(
    ["category-report", params],
    () => reportsActions.getCategoryReport(params)
  );

  return (
    <ReportPageLayout
      title="Reporte por Categoria"
      description="Analisis de desempeño por linea de producto"
      filters={
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onRefresh={() => mutate()}
          isRefreshing={isLoading}
        />
      }
    >
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
            <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Ventas Netas Totales</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(data.total_net_sales)}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Cantidad Vendida Total</p>
              <p className="text-2xl font-bold text-foreground">{data.total_quantity_sold}</p>
            </div>
          </div>

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
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Ventas Netas</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Cantidad Vendida</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">% Participacion</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Distribucion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.items.map((item, index) => (
                      <tr key={item.category_id ?? index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{item.category_name}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{formatCurrency(item.net_sales)}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{item.quantity_sold}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{formatPercentage(item.share_percentage)}</td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(parseFloat(item.share_percentage), 100)}%` }}
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
    </ReportPageLayout>
  );
}
