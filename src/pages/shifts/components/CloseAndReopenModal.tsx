import { useState } from "preact/hooks";
import { X, Lock, DollarSign, Loader2, AlertCircle, Info, Clock, CheckCircle } from "lucide-preact";
import { useAuthStore } from "@/store/authStore";
import { shiftsActions } from "@/actions/shifts";
import { openShiftSchema } from "@/validators/shift";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Shift } from "@/types/shift";

interface CloseAndReopenModalProps {
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

function calcDurationMinutes(from: string): number {
  return Math.floor((Date.now() - new Date(from).getTime()) / 60_000);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

type Step = "form" | "closing" | "opening";

export default function CloseAndReopenModal({
  shift,
  onClose,
  onSuccess,
}: CloseAndReopenModalProps) {
  const { session } = useAuthStore();
  const [openingBalance, setOpeningBalance] = useState("");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);

  const isLoading = step === "closing" || step === "opening";

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const raw = parseFloat(openingBalance);
    const result = openShiftSchema.safeParse({ opening_balance: isNaN(raw) ? 0 : raw });
    if (!result.success) {
      setBalanceError(result.error.errors[0]?.message ?? "Valor inválido");
      return;
    }
    setBalanceError(null);
    if (!session) return;

    setError(null);
    setStep("closing");
    try {
      await shiftsActions.completeShiftClosure();
    } catch (e) {
      setError(
        typeof e === "string"
          ? `Error al cerrar el turno: ${e}`
          : "Error al cerrar el turno. Intenta nuevamente.",
      );
      setStep("form");
      return;
    }

    setStep("opening");
    try {
      await shiftsActions.openShift({
        user_id: session.user_id,
        opening_balance: result.data.opening_balance,
      });
      onSuccess();
    } catch (e) {
      setError(
        typeof e === "string"
          ? `El turno se cerró correctamente, pero no se pudo abrir uno nuevo: ${e}. Por favor, abre un turno manualmente.`
          : "El turno se cerró pero no se pudo abrir uno nuevo. Por favor, abre un turno manualmente.",
      );
      setStep("form");
    }
  };

  const duration = calcDurationMinutes(shift.opened_at);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Lock size={16} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cerrar y abrir nuevo turno</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Info / progress */}
          {isLoading ? (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
              <Loader2 size={16} className="text-blue-600 animate-spin shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                {step === "closing" ? "Cerrando turno actual..." : "Abriendo nuevo turno..."}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
              <Info size={16} className="text-slate-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                El turno #{shift.id} se cerrará y se abrirá uno nuevo con el fondo que indiques.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Turno a cerrar */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Turno a cerrar
            </p>
            <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                <Clock size={14} />
                <span>Turno #{shift.id}</span>
                <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  PEND. CIERRE
                </span>
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duración</span>
                <span className="font-semibold tabular-nums">{formatDuration(duration)}</span>
              </div>
            </div>
          </div>

          {/* Nuevo turno */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Nuevo turno
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="new-opening-balance">
                Fondo inicial <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <DollarSign size={14} />
                </span>
                <Input
                  id="new-opening-balance"
                  type="number"
                  className="pl-8"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={openingBalance}
                  onInput={(e) => {
                    setOpeningBalance((e.target as HTMLInputElement).value);
                    setBalanceError(null);
                  }}
                  disabled={isLoading}
                  aria-invalid={!!balanceError}
                />
              </div>
              {balanceError && (
                <p className="text-xs text-red-600" role="alert">
                  {balanceError}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {step === "closing" ? "Cerrando..." : "Abriendo..."}
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Cerrar y abrir nuevo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
