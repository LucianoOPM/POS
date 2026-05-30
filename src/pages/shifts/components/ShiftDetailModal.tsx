import { X } from "lucide-preact";
import type { ShiftDetail } from "@/types/shift";
import { PERMISSIONS } from "@/types/permissions";
import { useAuthStore } from "@/store/authStore";

interface ShiftDetailModalProps {
  shift: ShiftDetail;
  onClose: () => void;
  onVoidRequest?: (shift: ShiftDetail) => void;
}

type ShiftStatus = "OPEN" | "PENDING_CLOSURE" | "CLOSED" | "VOIDED";

const STATUS_CONFIG: Record<ShiftStatus, { label: string; color: string }> = {
  OPEN: { label: "Abierto", color: "bg-green-100 text-green-700 border-green-200" },
  PENDING_CLOSURE: { label: "Pendiente de cierre", color: "bg-amber-100 text-amber-700 border-amber-200" },
  CLOSED: { label: "Cerrado", color: "bg-gray-100 text-gray-600 border-gray-200" },
  VOIDED: { label: "Anulado", color: "bg-red-100 text-red-700 border-red-200" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 60) return `${minutes} minutos`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hora${h !== 1 ? "s" : ""}`;
}

export default function ShiftDetailModal({ shift, onClose, onVoidRequest }: ShiftDetailModalProps) {
  const status = shift.status as ShiftStatus;
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600 border-gray-200" };
  const hasVoidPermission = useAuthStore((s) => s.hasPermission(PERMISSIONS.SHIFTS_VOID));

  const canVoid = (status === "OPEN" || status === "PENDING_CLOSURE") && hasVoidPermission;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Turno #{shift.id}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}
            >
              {cfg.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Usuario</p>
              <p className="text-sm font-medium text-gray-800">
                {shift.username ?? (
                  <span className="font-mono text-gray-500">
                    {shift.user_id.slice(0, 12)}…
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Fondo inicial</p>
              <p className="text-sm font-semibold text-gray-800">
                ${parseFloat(shift.opening_balance).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Apertura</p>
              <p className="text-sm text-gray-800">{formatDate(shift.opened_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Cierre</p>
              <p className="text-sm text-gray-800">{formatDate(shift.closed_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Duración</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDuration(shift.duration_minutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Creado</p>
              <p className="text-sm text-gray-800">{formatDate(shift.created_at)}</p>
            </div>
          </div>

          {/* Sección de auditoría de anulación */}
          {status === "VOIDED" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Auditoría de anulación</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-red-500 mb-0.5">Anulado por</p>
                  <p className="text-sm font-medium text-red-800">
                    {shift.voided_by_username ?? shift.voided_by ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-red-500 mb-0.5">Fecha de anulación</p>
                  <p className="text-sm text-red-800">{formatDate(shift.voided_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-red-500 mb-0.5">Motivo</p>
                <p className="text-sm text-red-800">{shift.void_reason ?? "—"}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer con botón de anulación */}
        {canVoid && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => onVoidRequest?.(shift)}
              className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Anular turno
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
