import { useState } from "preact/hooks";
import { X, DollarSign, Clock, Loader2, AlertCircle } from "lucide-preact";
import { useAuthStore } from "@/store/authStore";
import { shiftsActions } from "@/actions/shifts";
import { openShiftSchema } from "@/validators/shift";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface OpenShiftModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function OpenShiftModal({ onClose, onSuccess }: OpenShiftModalProps) {
  const { session } = useAuthStore();
  const [openingBalance, setOpeningBalance] = useState("");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsLoading(true);
    setError(null);
    try {
      await shiftsActions.openShift({
        user_id: session.user_id,
        opening_balance: result.data.opening_balance,
      });
      onSuccess();
    } catch (e) {
      setError(typeof e === "string" ? e : "Error al abrir el turno. Intenta nuevamente.");
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Abrir Turno</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="opening-balance-input">
              Fondo inicial <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <DollarSign size={14} />
              </span>
              <Input
                id="opening-balance-input"
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
            <p className="text-xs text-muted-foreground">
              Monto en efectivo disponible al inicio del turno.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Abriendo...
                </>
              ) : (
                "Abrir turno"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
