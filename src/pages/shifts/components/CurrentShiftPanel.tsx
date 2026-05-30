import { Clock, Loader2, AlertCircle } from "lucide-preact";
import { Button } from "@/components/ui/button";
import type { Shift } from "@/types/shift";

interface CurrentShiftPanelProps {
  shift: Shift | null;
  isLoading: boolean;
  hasOpenPermission: boolean;
  hasClosePermission: boolean;
  onOpen: () => void;
  onStartClosure: () => void;
  onCompleteClosure: () => void;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(typeof value === "string" ? parseFloat(value) : value);
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function CurrentShiftPanel({
  shift,
  isLoading,
  hasOpenPermission,
  hasClosePermission,
  onOpen,
  onStartClosure,
  onCompleteClosure,
}: CurrentShiftPanelProps) {
  if (isLoading) {
    return (
      <div className="mx-6 mt-4 mb-2 rounded-xl border border-gray-200 bg-white px-5 py-3.5 flex items-center gap-3">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Verificando turno activo...</span>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="mx-6 mt-4 mb-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Sin turno activo</p>
            <p className="text-xs text-muted-foreground">
              Abre un nuevo turno para registrar ventas y reembolsos.
            </p>
          </div>
        </div>
        {hasOpenPermission && (
          <Button variant="brand" size="sm" onClick={onOpen} className="shrink-0">
            Abrir turno
          </Button>
        )}
      </div>
    );
  }

  if (shift.status === "OPEN") {
    return (
      <div className="mx-6 mt-4 mb-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-green-800">Turno #{shift.id}</span>
            <span className="ml-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
              Activo
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-green-700">
            <span>
              Fondo:{" "}
              <strong className="tabular-nums">{formatCurrency(shift.opening_balance)}</strong>
            </span>
            <span>
              Apertura: <strong>{formatTime(shift.opened_at)}</strong>
            </span>
          </div>
        </div>
        {hasClosePermission && (
          <Button
            size="sm"
            onClick={onStartClosure}
            className="shrink-0 bg-white border border-green-300 text-green-800 hover:bg-green-100"
            variant="outline"
          >
            Iniciar cierre
          </Button>
        )}
      </div>
    );
  }

  if (shift.status === "PENDING_CLOSURE") {
    return (
      <div className="mx-6 mt-4 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-800">Turno #{shift.id}</span>
            <span className="ml-1 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
              Pendiente de cierre
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-amber-700">
            Ventas y reembolsos bloqueados
          </span>
        </div>
        {hasClosePermission && (
          <Button
            size="sm"
            onClick={onCompleteClosure}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0"
          >
            Completar cierre
          </Button>
        )}
      </div>
    );
  }

  return null;
}
