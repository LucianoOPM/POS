import { useState } from "preact/hooks";
import { X, TimerOff, Loader2, AlertCircle, Info, Clock } from "lucide-preact";
import { shiftsActions } from "@/actions/shifts";
import { Button } from "@/components/ui/button";
import type { Shift } from "@/types/shift";

interface StartClosureModalProps {
  shift: Shift;
  onClose: () => void;
  onSuccess: () => void;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(typeof value === "string" ? parseFloat(value) : value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function StartClosureModal({ shift, onClose, onSuccess }: StartClosureModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await shiftsActions.startShiftClosure();
      onSuccess();
    } catch (e) {
      setError(typeof e === "string" ? e : "Error al iniciar el cierre. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-amber-900">Iniciar Cierre de Turno</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-amber-200 bg-amber-100 text-amber-700">
              #{shift.id}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-amber-400 hover:text-amber-600 p-1 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Durante el cierre no se podrán registrar ventas ni reembolsos.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
              <Clock size={14} />
              <span>Turno activo #{shift.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fondo inicial</span>
              <span className="font-semibold tabular-nums">
                {formatCurrency(shift.opening_balance)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Apertura</span>
              <span className="font-semibold">{formatDate(shift.opened_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <TimerOff size={14} />
                Iniciando...
              </>
            ) : (
              <>
                <TimerOff size={14} />
                Iniciar cierre
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
