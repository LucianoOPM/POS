import { useState, useEffect } from "preact/hooks";
import useSWR from "swr";
import {
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Package,
  RotateCcw,
  AlertCircle,
  ClipboardX,
  CreditCard,
  User,
  Calendar,
  Timer,
  Wallet,
} from "lucide-preact";
import { reportsActions, type ShiftReportResult } from "@/actions/reports";
import { shiftsActions } from "@/actions/shifts";
import type { ShiftDetail } from "@/types/shift";
import ReportPageLayout from "../components/ReportPageLayout";
import KpiCard from "../components/KpiCard";

const formatCurrency = (value: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(parseFloat(value));

const formatPercentage = (value: string) => `${parseFloat(value).toFixed(2)}%`;

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const formatDuration = (minutes: number | null) => {
  if (minutes === null) return "En curso";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
};

const PAYMENT_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  OPEN: { label: "Abierto", classes: "bg-green-50 text-green-700 border border-green-200" },
  CLOSED: { label: "Cerrado", classes: "bg-gray-100 text-gray-600 border border-gray-200" },
  PENDING_CLOSURE: {
    label: "Pendiente de cierre",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  VOIDED: { label: "Anulado", classes: "bg-red-50 text-red-700 border border-red-200" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    classes: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
}

export default function ShiftReport() {
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  const { data: shifts, isLoading: shiftsLoading } = useSWR<ShiftDetail[]>(
    "shifts-list-for-report",
    () => shiftsActions.getShifts(),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (shifts && shifts.length > 0 && selectedShiftId === null) {
      setSelectedShiftId(shifts[0].id);
    }
  }, [shifts]);

  const { data, isLoading, error, mutate } = useSWR<ShiftReportResult>(
    selectedShiftId ? ["shift-report", selectedShiftId] : null,
    () => reportsActions.getShiftReport(selectedShiftId!),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const shiftFilter = (
    <div className="flex items-center gap-2">
      <label htmlFor="shift-selector" className="text-sm text-muted-foreground whitespace-nowrap">
        Turno:
      </label>
      <div className="relative">
        {shiftsLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-muted border-t-primary-500 rounded-full animate-spin" />
        )}
        <select
          id="shift-selector"
          value={selectedShiftId ?? ""}
          onChange={(e) => setSelectedShiftId(Number((e.target as HTMLSelectElement).value))}
          disabled={shiftsLoading}
          className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background cursor-pointer w-full sm:min-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {shiftsLoading && <option value="">Cargando turnos...</option>}
          {!shiftsLoading && (!shifts || shifts.length === 0) && (
            <option value="">Sin turnos disponibles</option>
          )}
          {shifts?.map((shift) => (
            <option key={shift.id} value={shift.id}>
              #{shift.id} — {formatDateTime(shift.opened_at)} — {shift.username ?? "—"}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => mutate()}
        disabled={isLoading || !selectedShiftId}
        aria-label="Actualizar reporte"
        className="h-9 w-9 flex items-center justify-center hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );

  const renderContent = () => {
    if (!selectedShiftId && !shiftsLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Sin turnos disponibles</h3>
          <p className="text-sm text-muted-foreground">No se encontraron turnos registrados</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar el reporte</h3>
          <p className="text-sm text-muted-foreground">{String(error)}</p>
        </div>
      );
    }

    if (isLoading || !data) {
      return (
        <div className="space-y-6">
          <div className="h-28 bg-white rounded-xl border border-border animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-border animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 bg-white rounded-xl border border-border animate-pulse" />
            <div className="h-48 bg-white rounded-xl border border-border animate-pulse" />
          </div>
          <div className="h-64 bg-white rounded-xl border border-border animate-pulse" />
        </div>
      );
    }

    const { shift_info, sales_summary, payment_methods, top_products, refunds_summary } = data;
    const hasRefunds = parseFloat(sales_summary.total_refunded) > 0;
    const highRefundRate = parseFloat(refunds_summary.refund_percentage) > 5;

    return (
      <div className="space-y-6">
        {/* Info del turno */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-50">
                <Clock className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Turno</p>
                <p className="text-xl font-bold text-foreground">#{shift_info.shift_id}</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-border" />

            <StatusBadge status={shift_info.status} />

            <div className="hidden sm:block w-px h-10 bg-border" />

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Abierto por</p>
                <p className="text-sm font-medium text-foreground">{shift_info.opened_by}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Apertura</p>
                <p className="text-sm font-medium text-foreground">{formatDateTime(shift_info.opened_at)}</p>
              </div>
            </div>

            {shift_info.closed_at && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Cierre</p>
                  <p className="text-sm font-medium text-foreground">{formatDateTime(shift_info.closed_at)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duración</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDuration(shift_info.duration_minutes)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Balance apertura</p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(shift_info.opening_balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Ventas Brutas"
            value={formatCurrency(sales_summary.gross_sales)}
            icon={DollarSign}
            color="#3a9d5f"
          />
          <KpiCard
            title="Ventas Netas"
            value={formatCurrency(sales_summary.net_sales)}
            icon={TrendingUp}
            color="#22c55e"
          />
          <KpiCard
            title="Número de Ventas"
            value={String(sales_summary.sales_count)}
            icon={ShoppingCart}
            color="#3b82f6"
          />
          <KpiCard
            title="Ticket Promedio"
            value={formatCurrency(sales_summary.average_ticket)}
            icon={BarChart3}
            color="#6366f1"
          />
          <KpiCard
            title="Productos Vendidos"
            value={String(sales_summary.total_products_sold)}
            icon={Package}
            color="#06b6d4"
          />
          {hasRefunds && (
            <KpiCard
              title="Total Reembolsado"
              value={formatCurrency(sales_summary.total_refunded)}
              subtitle={`${refunds_summary.refunds_count} reembolso${refunds_summary.refunds_count !== 1 ? "s" : ""}`}
              trend="down"
              icon={RotateCcw}
              color="#ef4444"
            />
          )}
        </div>

        {/* Métodos de pago + Resumen reembolsos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métodos de pago */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Métodos de Pago</h2>
            </div>
            {payment_methods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CreditCard className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Sin transacciones registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {payment_methods.map((pm, index) => (
                  <div key={pm.payment_method_id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {pm.payment_method_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(pm.total_amount)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({formatPercentage(pm.share_percentage)})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(parseFloat(pm.share_percentage), 100)}%`,
                            backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {pm.transaction_count} transacción{pm.transaction_count !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen de reembolsos */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Resumen de Reembolsos</h2>
            </div>
            <div className="p-6 space-y-4">
              {highRefundRate && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Tasa de reembolso alta</p>
                    <p className="text-xs text-amber-700">
                      La tasa supera el umbral recomendado del 5%
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(refunds_summary.total_refunded)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total reembolsado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{refunds_summary.refunds_count}</p>
                  <p className="text-xs text-muted-foreground mt-1">Nº reembolsos</p>
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${highRefundRate ? "text-amber-600" : "text-foreground"}`}
                  >
                    {formatPercentage(refunds_summary.refund_percentage)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">% sobre ventas</p>
                </div>
              </div>
              {refunds_summary.refunds_count === 0 && (
                <div className="pt-2 text-center">
                  <p className="text-sm font-medium text-green-600">Sin reembolsos en este turno</p>
                  <p className="text-xs text-muted-foreground">Excelente gestión</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Productos */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Top Productos</h2>
          </div>
          {top_products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardX className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay productos vendidos en este turno</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-8">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Cant. Vendida
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Ingresos Netos
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      % Part.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {top_products.map((product, index) => (
                    <tr
                      key={product.product_id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {product.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {product.category_name ?? "Sin categoría"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-foreground">
                        {product.quantity_sold}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {formatCurrency(product.net_revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                        {formatPercentage(product.share_percentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ReportPageLayout
      title="Reporte de Turno"
      description="Análisis detallado de ventas, pagos y productos por turno"
      filters={shiftFilter}
    >
      {renderContent()}
    </ReportPageLayout>
  );
}
