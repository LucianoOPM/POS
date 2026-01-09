import { DollarSign, TrendingUp, TrendingDown, Receipt, Percent, Calculator } from "lucide-preact";
import { MOCK_FINANCIAL_SUMMARY, MOCK_DAILY_FINANCIAL } from "@/mocks/reports";

interface StatCardProps {
  label: string;
  value: string;
  icon: typeof DollarSign;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, valueColor = "text-gray-800" }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
        <p className={`text-xl font-black ${valueColor}`}>{value}</p>
      </div>
      <div className={`${iconBg} p-2 rounded-lg ${iconColor}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

export default function FinancialReport() {
  const summary = MOCK_FINANCIAL_SUMMARY;
  const dailyData = MOCK_DAILY_FINANCIAL;

  return (
    <div className="space-y-6">
      {/* Resumen financiero */}
      <div>
        <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Resumen Financiero</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Ingresos Brutos"
            value={`$${summary.grossRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            label="Ingresos Netos"
            value={`$${summary.netRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBg="bg-green-50"
            valueColor="text-green-600"
          />
          <StatCard
            label="Costos Totales"
            value={`$${summary.totalCosts.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBg="bg-red-50"
            valueColor="text-red-600"
          />
          <StatCard
            label="Ganancia Bruta"
            value={`$${summary.grossProfit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            icon={Receipt}
            iconColor="text-primary-600"
            iconBg="bg-primary-50"
            valueColor="text-primary-600"
          />
          <StatCard
            label="Margen de Ganancia"
            value={`${summary.profitMargin.toFixed(1)}%`}
            icon={Percent}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard
            label="Impuestos Recaudados"
            value={`$${summary.taxCollected.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
            icon={Calculator}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
        </div>
      </div>

      {/* Desglose diario */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold uppercase text-gray-500">Desglose Diario</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Ingresos</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Costos</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Ganancia</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyData.map((day) => {
                const margin = ((day.profit / day.revenue) * 100).toFixed(1);
                return (
                  <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {new Date(day.date).toLocaleDateString("es-MX", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      ${day.revenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      ${day.costs.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-primary-600">
                      ${day.profit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(margin) >= 30
                            ? "bg-green-100 text-green-700"
                            : parseFloat(margin) >= 20
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-800">Total</td>
                <td className="px-4 py-3 text-sm text-right font-bold">
                  ${dailyData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                  ${dailyData.reduce((acc, d) => acc + d.costs, 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold text-primary-600">
                  ${dailyData.reduce((acc, d) => acc + d.profit, 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right font-bold">
                  {(
                    (dailyData.reduce((acc, d) => acc + d.profit, 0) /
                      dailyData.reduce((acc, d) => acc + d.revenue, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
