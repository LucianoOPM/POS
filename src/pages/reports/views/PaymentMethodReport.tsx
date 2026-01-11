import { useState } from "preact/hooks";
import useSWR from "swr";
import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, RefreshCw } from "lucide-preact";
import { reportsActions, type PaymentMethodReportResult, type PaymentMethodReportParams } from "@/actions/reports";

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

// Colors for payment methods
const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PaymentMethodReport() {
  const [, navigate] = useLocation();
  const defaultRange = getDefaultDateRange();
  const [params, setParams] = useState<PaymentMethodReportParams>(defaultRange);

  const { data, isLoading, error, mutate } = useSWR<PaymentMethodReportResult>(
    ["payment-method-report", params],
    () => reportsActions.getPaymentMethodReport(params)
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
              <h1 className="text-xl font-semibold text-foreground">Metodos de Pago</h1>
              <p className="text-sm text-muted-foreground">Conciliacion financiera y distribucion de pagos</p>
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
            {/* Summary cards */}
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

            {/* Payment method cards */}
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
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${COLORS[index % COLORS.length]}15` }}
                      >
                        <CreditCard
                          className="w-6 h-6"
                          style={{ color: COLORS[index % COLORS.length] }}
                        />
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
      </div>
    </div>
  );
}
