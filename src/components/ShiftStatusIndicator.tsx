import { Clock } from "lucide-preact";
import { useCurrentShift } from "@/hooks/useCurrentShift";
import type { Shift } from "@/types/shift";

function formatOpenedAt(openedAt: string): string {
  return new Date(openedAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Partial<Record<Shift["status"], string>> = {
  OPEN: "bg-green-50 border-green-200 text-green-700",
  PENDING_CLOSURE: "bg-amber-50 border-amber-200 text-amber-700",
};

const STATUS_DOT: Partial<Record<Shift["status"], string>> = {
  OPEN: "bg-green-500",
  PENDING_CLOSURE: "bg-amber-400",
};

const STATUS_LABEL: Partial<Record<Shift["status"], string>> = {
  OPEN: "ABIERTO",
  PENDING_CLOSURE: "CIERRE PEND.",
};

function ActiveShiftPill({ shift }: { shift: Shift }) {
  const styles = STATUS_STYLES[shift.status];
  const dotColor = STATUS_DOT[shift.status];
  const label = STATUS_LABEL[shift.status];

  if (!styles) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${styles}`}
      title={`Turno #${shift.id} abierto a las ${formatOpenedAt(shift.opened_at)}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <Clock size={11} className="shrink-0 opacity-60" />
      <span className="tabular-nums">
        #{shift.id} · {label} · {formatOpenedAt(shift.opened_at)}
      </span>
    </div>
  );
}

function NoShiftPill() {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
      <span className="w-2 h-2 rounded-full bg-gray-300" />
      Sin turno activo
    </div>
  );
}

function LoadingPill() {
  return <div className="h-7 w-40 rounded-full bg-gray-100 animate-pulse border border-gray-100" />;
}

export default function ShiftStatusIndicator() {
  const { shift, isLoading } = useCurrentShift();

  if (isLoading) return <LoadingPill />;
  if (!shift) return <NoShiftPill />;
  return <ActiveShiftPill shift={shift} />;
}
