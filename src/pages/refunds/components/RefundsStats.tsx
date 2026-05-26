import { Receipt, DollarSign, TrendingDown, Package } from "lucide-preact";
import type { RefundRecord } from "@/types/refund";

interface RefundsStatsProps {
  refunds: RefundRecord[];
  totalItems?: number;
}

export default function RefundsStats({ refunds, totalItems }: RefundsStatsProps) {
  // Calcular estadísticas
  const totalRefunds = totalItems ?? refunds.length;
  const totalAmount = refunds.reduce(
    (acc, r) => acc + parseFloat(r.amount || "0"),
    0
  );
  const avgAmount = refunds.length > 0 ? totalAmount / refunds.length : 0;
  const totalProducts = refunds.reduce(
    (acc, r) => acc + (r.items_count || 0),
    0
  );

  const stats = [
    {
      label: "Total Reembolsos",
      value: totalRefunds.toString(),
      icon: Receipt,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Monto Total",
      value: `$${totalAmount.toFixed(2)}`,
      icon: DollarSign,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Promedio",
      value: `$${avgAmount.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Productos Devueltos",
      value: totalProducts.toString(),
      icon: Package,
      color: "text-gray-600",
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
