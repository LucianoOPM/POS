import useSWR from "swr";
import { CreditCard, FileDown, Loader2 } from "lucide-preact";
import { reportsActions, type PaymentMethodReportResult, type PaymentMethodReportParams } from "@/actions/reports";
import { useReportDateRange } from "@/hooks/useReportDateRange";
import { useExportReport } from "@/hooks/useExportReport";
import { Button } from "@/components/ui/button";
import ReportPageLayout from "../components/ReportPageLayout";
import DateRangeFilter from "../components/DateRangeFilter";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

const formatPercentage = (value: string) => `${parseFloat(value).toFixed(2)}%`;

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PaymentMethodReport() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useReportDateRange("current-month");
  const params: PaymentMethodReportParams = { date_from: dateFrom, date_to: dateTo };

  const { exporting, handleExport } = useExportReport(() =>
    reportsActions.exportPaymentMethodReport(params)
  );

  const { data, isLoading, error, mutate } = useSWR<PaymentMethodReportResult>(
    ["payment-method-report", params],
    () => reportsActions.getPaymentMethodReport(params)
  );

  return (
    <ReportPageLayout
      title="Metodos de Pago"
      description="Conciliacion financiera y distribucion de pagos"
      filters={
        <>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onRefresh={() => mutate()}
            isRefreshing={isLoading}
          />
          <div className="w-px h-6 bg-border" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || isLoading || !data}
          >
            {exporting
              ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              : <FileDown className="w-4 h-4 mr-1.5" />}
            Exportar
          </Button>
        </>
      }
    >
      {error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 bg-red-100 rounded-full mb-4">
            <CreditCard className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar el reporte</h3>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Cobrado</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(data.total_amount)}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Total de Transacciones</p>
              <p className="text-2xl font-bold text-foreground">{data.total_transactions}</p>
            </div>
          </div>

          {data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-border">
              <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay datos para el periodo seleccionado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((item, index) => (
                <div key={item.payment_method_id} className="bg-white rounded-xl border border-border p-6 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.payment_method_name}</h3>
                      <p className="text-2xl font-bold mt-2" style={{ color: COLORS[index % COLORS.length] }}>
                        {formatCurrency(item.total_amount)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS[index % COLORS.length]}15` }}>
                      <CreditCard className="w-6 h-6" style={{ color: COLORS[index % COLORS.length] }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.transaction_count} transacciones</span>
                    <span className="font-medium text-foreground">{formatPercentage(item.share_percentage)}</span>
                  </div>
                  <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(parseFloat(item.share_percentage), 100)}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </ReportPageLayout>
  );
}
