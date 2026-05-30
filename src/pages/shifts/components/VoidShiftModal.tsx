import { useState } from "preact/hooks";
import { X, AlertTriangle } from "lucide-preact";
import type { ShiftDetail } from "@/types/shift";
import { shiftsActions } from "@/actions/shifts";

interface VoidShiftModalProps {
  shift: ShiftDetail;
  onClose: () => void;
  onSuccess: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VoidShiftModal({ shift, onClose, onSuccess }: VoidShiftModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReasonValid = reason.trim().length >= 5 && reason.trim().length <= 500;

  async function handleConfirm() {
    if (!isReasonValid) return;
    setIsLoading(true);
    setError(null);
    try {
      await shiftsActions.voidShift(shift.id, reason.trim());
      onSuccess();
    } catch (e) {
      setError(typeof e === "string" ? e : "Error al anular el turno");
      setIsLoading(false);
    }
  }

  return (
    <div
      className="absolute inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-red-900">Anular Turno</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-200 bg-red-100 text-red-700">
              #{shift.id}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Advertencia */}
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              Esta acción es <strong>irreversible</strong>. El turno quedará anulado con trazabilidad completa.
            </p>
          </div>

          {/* Resumen del turno */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Usuario</p>
              <p className="font-medium text-gray-800 truncate">
                {shift.username ?? shift.user_id.slice(0, 10) + "…"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Fondo inicial</p>
              <p className="font-semibold text-gray-800">
                ${parseFloat(shift.opening_balance).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Apertura</p>
              <p className="text-gray-800">{formatDate(shift.opened_at)}</p>
            </div>
          </div>

          {/* Campo motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
              rows={3}
              placeholder="Describe el motivo de la anulación (mínimo 5 caracteres)"
              value={reason}
              onInput={(e) => {
                setReason((e.target as HTMLTextAreaElement).value);
                setError(null);
              }}
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {reason.trim().length}/500
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isReasonValid || isLoading}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Anulando…" : "Confirmar anulación"}
          </button>
        </div>
      </div>
    </div>
  );
}
