import { ShieldCheck, ShieldOff, Users } from "lucide-preact";
import type { UserRecord } from "@/types";

interface UsersStatsProps {
  users: UserRecord[];
  totalItems?: number;
}

export default function UsersStats({ users, totalItems }: UsersStatsProps) {
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  const stats = [
    {
      label: "Total Usuarios",
      value: totalItems ?? users.length,
      icon: Users,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Activos",
      value: activeUsers,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Inactivos",
      value: inactiveUsers,
      icon: ShieldOff,
      color: "text-gray-500",
      bg: "bg-gray-100",
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
