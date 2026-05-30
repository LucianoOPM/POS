import { X, ArrowDownUp } from "lucide-preact";
import useSWR from "swr";
import { stockMovementActions } from "@/actions/stock_movements";
import {
  MOVEMENT_TYPE_STYLES,
  MOVEMENT_TYPE_LABELS,
  REASON_LABELS,
  formatDate,
} from "@/utils/stockMovements";

interface Props {
  productId: number;
  productName: string;
  onClose: () => void;
}

export default function ProductMovementsModal({ productId, productName, onClose }: Props) {
  const { data: movements, isLoading } = useSWR(
    ["product_movements", productId],
    () => stockMovementActions.getProductMovements(productId)
  );

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Historial de movimientos</h3>
            <p className="text-sm text-gray-500 mt-0.5">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <span>Cargando historial...</span>
            </div>
          )}

          {!isLoading && (!movements || movements.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ArrowDownUp size={40} className="mb-3 text-gray-200" />
              <p>Este producto no tiene movimientos registrados.</p>
            </div>
          )}

          {!isLoading && movements && movements.length > 0 && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Ant.</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Nuevo</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((m) => {
                  const typeStyle = MOVEMENT_TYPE_STYLES[m.movement_type] ?? "bg-gray-100 text-gray-700 border-gray-200";
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(m.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeStyle}`}>
                          {MOVEMENT_TYPE_LABELS[m.movement_type] ?? m.movement_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-gray-800">{m.quantity}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-500">{m.previous_stock}</td>
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">{m.new_stock}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {REASON_LABELS[m.reason] ?? m.reason}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {m.created_by_username ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
