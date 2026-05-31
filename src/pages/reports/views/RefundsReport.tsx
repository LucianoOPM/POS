import useSWR from "swr";
import { RotateCcw, AlertTriangle } from "lucide-preact";
import { reportsActions, type RefundsReportResult, type RefundsReportParams } from "@/actions/reports";
import { useReportDateRange } from "@/hooks/useReportDateRange";
import ReportPageLayout from "../components/ReportPageLayout";
import DateRangeFilter from "../components/DateRangeFilter";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

const formatPercentage = (value: string) => `${parseFloat(value).toFixed(2)}%`;

export default function RefundsReport() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useReportDateRange("current-month");
  const params: RefundsReportParams = { date_from: dateFrom, date_to: dateTo };

  const { data, isLoading, error, mutate } = useSWR<RefundsReportResult>(
    ["refunds-report", params],
    () => reportsActions.getRefundsReport(params)
  );

  return (
    <ReportPageLayout
      title="Reporte de Reembolsos"
      description="Analisis de devoluciones y productos mas reembolsados"
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
            <RotateCcw className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar el reporte</h3>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Reembolsado</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(data.total_refunded)}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Numero de Reembolsos</p>
              <p className="text-2xl font-bold text-foreground">{data.refunds_count}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">% Sobre Ventas</p>
              <p className="text-2xl font-bold text-foreground">{formatPercentage(data.refund_percentage)}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Ventas Brutas</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.gross_sales)}</p>
            </div>
          </div>

          {parseFloat(data.refund_percentage) > 5 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Tasa de reembolso alta</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  La tasa de reembolso supera el 5%. Considera revisar los productos con mayor indice de devoluciones.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Productos Mas Reembolsados</h2>
              <p className="text-sm text-muted-foreground mt-1">Top 10 productos con mayor cantidad de devoluciones</p>
            </div>
            {data.top_refunded_products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <RotateCcw className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay reembolsos en el periodo seleccionado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Cantidad Reembolsada</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Monto Reembolsado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.top_refunded_products.map((item, index) => (
                      <tr key={item.product_id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{item.product_name}</td>
                        <td className="px-6 py-4 text-sm text-right text-foreground">{item.quantity_refunded}</td>
                        <td className="px-6 py-4 text-sm text-right text-red-500">{formatCurrency(item.amount_refunded)}</td>
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
