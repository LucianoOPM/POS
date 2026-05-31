import useSWR from "swr";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Package } from "lucide-preact";
import { reportsActions, type DashboardResult, type DashboardParams } from "@/actions/reports";
import { useReportDateRange } from "@/hooks/useReportDateRange";
import ReportPageLayout from "../components/ReportPageLayout";
import DateRangeFilter from "../components/DateRangeFilter";
import KpiCard from "../components/KpiCard";

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(num);
};

export default function DashboardReport() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useReportDateRange("current-month");
  const params: DashboardParams = { date_from: dateFrom, date_to: dateTo };

  const { data, isLoading, error, mutate } = useSWR<DashboardResult>(
    ["dashboard-report", params],
    () => reportsActions.getDashboard(params),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  return (
    <ReportPageLayout
      title="Dashboard Ejecutivo"
      description="Vista resumida del estado del negocio"
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
        data.sales_count === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Sin ventas en el período</h3>
            <p className="text-sm text-muted-foreground">Ajusta el rango de fechas para ver datos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard title="Ventas Brutas" value={formatCurrency(data.gross_sales)} icon={DollarSign} color="#22c55e" />
              <KpiCard title="Total Reembolsado" value={formatCurrency(data.total_refunded)} icon={TrendingDown} color="#ef4444" />
              <KpiCard title="Ventas Netas" value={formatCurrency(data.net_sales)} icon={TrendingUp} color="#3b82f6" />
              <KpiCard title="Número de Ventas" value={data.sales_count.toString()} icon={ShoppingCart} color="#8b5cf6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard title="Ticket Promedio" value={formatCurrency(data.average_ticket)} icon={DollarSign} color="#f59e0b" />
              <KpiCard title="Productos Vendidos" value={data.total_products_sold.toString()} icon={Package} color="#06b6d4" />
              <KpiCard
                title="Método de Pago Dominante"
                value={data.dominant_payment_method || "Sin datos"}
                subtitle={data.dominant_payment_method ? formatCurrency(data.dominant_payment_amount) : undefined}
                icon={CreditCard}
                color="#22c55e"
              />
              <KpiCard
                title="Producto Más Vendido"
                value={data.top_product || "Sin datos"}
                subtitle={data.top_product ? `${data.top_product_quantity} unidades` : undefined}
                icon={Package}
                color="#6366f1"
              />
            </div>
          </div>
        )
      ) : null}
    </ReportPageLayout>
  );
}
