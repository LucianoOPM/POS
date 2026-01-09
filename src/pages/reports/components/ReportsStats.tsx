import { Receipt, DollarSign, TrendingUp, Calculator } from "lucide-preact";
import type { ReportsStatsProps } from "@/types";

export default function ReportsStats({
  totalSales,
  totalRevenue,
  totalProfit,
  averageTicket,
}: ReportsStatsProps) {
  return (
    <div className="p-6 grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Total Ventas</p>
          <p className="text-2xl font-black text-gray-800">{totalSales}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
          <Receipt size={24} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Ingresos Totales</p>
          <p className="text-2xl font-black text-gray-800">
            ${totalRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-green-50 p-2 rounded-lg text-green-600">
          <DollarSign size={24} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Ganancia</p>
          <p className="text-2xl font-black text-primary-600">
            ${totalProfit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
          <TrendingUp size={24} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Ticket Promedio</p>
          <p className="text-2xl font-black text-gray-800">
            ${averageTicket.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
          <Calculator size={24} />
        </div>
      </div>
    </div>
  );
}
