import { AlertCircle, AlertTriangle, Banknote, Package } from "lucide-preact";
import type { Product } from "@/types";

interface InventoryStatsProps {
  products: Product[];
}

export default function InventoryStats({ products }: InventoryStatsProps) {
  const totalProducts = products.length;
  const inventoryValue = products.reduce((acc, p) => acc + parseFloat(p.cost) * p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="p-6 grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Total Productos</p>
          <p className="text-2xl font-black text-gray-800">{totalProducts}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
          <Package size={24} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Valor Inventario</p>
          <p className="text-2xl font-black text-gray-800">
            ${inventoryValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-green-50 p-2 rounded-lg text-green-600">
          <Banknote size={24} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Stock Bajo</p>
          <p className="text-2xl font-black text-orange-600">{lowStock}</p>
        </div>
        <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
          <AlertTriangle size={24} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">Agotados</p>
          <p className="text-2xl font-black text-red-600">{outOfStock}</p>
        </div>
        <div className="bg-red-50 p-2 rounded-lg text-red-600">
          <AlertCircle size={24} />
        </div>
      </div>
    </div>
  );
}
