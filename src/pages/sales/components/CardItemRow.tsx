import { Minus, Plus, Trash2 } from "lucide-preact";

interface Props {
  item: { code: string; tax: number; name: string; id: number; quantity: number; price: number };
  onUpdateQty: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  index: number;
}

export const CartItemRow = ({ item, onUpdateQty, onRemove, index }: Props) => (
  <div
    className={`flex items-center justify-between p-3 border-b border-gray-100 ${
      index % 2 === 0 ? "bg-white" : "bg-gray-50"
    }`}
  >
    <div className="flex-1 min-w-0 pr-4">
      <div className="font-medium text-gray-800 truncate">{item.name}</div>
      <div className="text-xs text-gray-500 flex gap-2">
        <span>{item.code}</span>
        {item.tax > 0 && <span className="bg-gray-200 px-1 rounded text-[10px]">IVA</span>}
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-300 rounded-md bg-white">
        <button
          onClick={() => onUpdateQty(item.id, -1)}
          className="p-1 hover:bg-gray-100 text-secondary-600 hover:text-red-500 disabled:opacity-30"
          disabled={item.quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <input
          type="text"
          value={item.quantity}
          readOnly
          className="w-8 text-center font-bold text-gray-800 focus:outline-none border-x border-gray-300 text-sm py-1"
        />
        <button
          onClick={() => onUpdateQty(item.id, 1)}
          className="p-1 hover:bg-gray-100 text-secondary-600 hover:text-green-600"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="text-right w-20">
        <div className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
        <div className="text-xs text-gray-400">${item.price.toFixed(2)} c/u</div>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);
