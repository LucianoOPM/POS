import { TrendingUp, TrendingDown } from "lucide-preact";
import type { ProductMovement } from "@/types";
import { MOCK_TOP_PRODUCTS, MOCK_LOW_PRODUCTS } from "@/mocks/reports";

interface ProductTableProps {
  products: ProductMovement[];
  title: string;
  icon: typeof TrendingUp;
  iconColor: string;
  iconBg: string;
}

function ProductTable({ products, title, icon: Icon, iconColor, iconBg }: ProductTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className={`${iconBg} p-1.5 rounded-lg`}>
          <Icon size={16} className={iconColor} />
        </div>
        <h3 className="text-sm font-bold uppercase text-gray-500">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">#</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Categoria</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Unidades</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Ingresos</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Ganancia</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Margen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs font-mono text-gray-400">{product.code}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">{product.unitsSold}</td>
                <td className="px-4 py-3 text-sm text-right">
                  ${product.revenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-primary-600">
                  ${product.profit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.profitMargin >= 25
                        ? "bg-green-100 text-green-700"
                        : product.profitMargin >= 15
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.profitMargin.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ProductMovementReport() {
  const topProducts = MOCK_TOP_PRODUCTS;
  const lowProducts = MOCK_LOW_PRODUCTS;

  const totalUnitsSold = topProducts.reduce((acc, p) => acc + p.unitsSold, 0) +
    lowProducts.reduce((acc, p) => acc + p.unitsSold, 0);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Total Unidades Vendidas</p>
            <p className="text-2xl font-black text-gray-800">{totalUnitsSold}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase">Productos Analizados</p>
            <p className="text-2xl font-black text-gray-800">{topProducts.length + lowProducts.length}</p>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Productos mas vendidos */}
      <ProductTable
        products={topProducts}
        title="Productos Mas Vendidos"
        icon={TrendingUp}
        iconColor="text-green-600"
        iconBg="bg-green-50"
      />

      {/* Productos menos vendidos */}
      <ProductTable
        products={lowProducts}
        title="Productos Menos Vendidos"
        icon={TrendingDown}
        iconColor="text-red-600"
        iconBg="bg-red-50"
      />
    </div>
  );
}
