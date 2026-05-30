import { Clock, CheckCircle, Circle, Timer } from "lucide-preact";
import type { ShiftDetail } from "@/types/shift";

interface ShiftsStatsProps {
  shifts: ShiftDetail[];
  totalItems: number;
}

function formatAvgDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ShiftsStats({ shifts, totalItems }: ShiftsStatsProps) {
  const openCount = shifts.filter(
    (s) => s.status === "OPEN" || s.status === "PENDING_CLOSURE"
  ).length;
  const closedCount = shifts.filter((s) => s.status === "CLOSED").length;

  const closedWithDuration = shifts.filter(
    (s) => s.duration_minutes !== null && s.status === "CLOSED"
  );
  const avgDuration =
    closedWithDuration.length > 0
      ? closedWithDuration.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0) /
        closedWithDuration.length
      : 0;

  const stats = [
    {
      label: "Total Turnos",
      value: totalItems.toString(),
      icon: Clock,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Activos",
      value: openCount.toString(),
      icon: Circle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Cerrados",
      value: closedCount.toString(),
      icon: CheckCircle,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
    {
      label: "Duración Promedio",
      value: avgDuration > 0 ? formatAvgDuration(avgDuration) : "—",
      icon: Timer,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="px-6 py-4">
      <div className="flex gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm"
          >
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
