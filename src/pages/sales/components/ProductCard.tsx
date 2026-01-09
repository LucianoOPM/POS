import type { SalesProduct } from "@/types";

interface ProductCardProps {
  product: SalesProduct;
  onAdd: (product: SalesProduct) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <button
      onClick={() => onAdd(product)}
      disabled={product.stock === 0}
      className={`flex flex-col items-start p-4 bg-white border border-secondary-300 rounded-lg shadow-sm hover:shadow-md hover:border-primary-500 transition-all active:scale-95 group focus:ring-2 focus:ring-primary-500 focus:outline-none h-32 justify-between w-full relative overflow-hidden ${
        product.stock <= 0
          ? "opacity-60 border-gray-200 bg-gray-50 cursor-not-allowed"
          : "border-secondary hover:shadow-md hover:border-primary"
      }`}
    >
      {product.stock <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 z-10 backdrop-blur-[1px]">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded transform -rotate-12">
            AGOTADO
          </span>
        </div>
      )}
      <div className="w-full">
        <span className="text-xs font-bold text-secondary-600 uppercase tracking-wider block mb-1">
          {product.category}
        </span>
        <span className="font-semibold text-gray-800 text-left line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
          {product.name}
        </span>
      </div>
      <div className="w-full flex justify-between items-end mt-2">
        <span className="text-xs text-gray-400">{product.code.slice(-4)}</span>
        <div className="text-right">
          <span className="font-bold text-lg text-gray-900">${product.price.toFixed(2)}</span>
          {product.stock > 0 && product.stock < 10 && (
            <div className="text-[10px] text-orange-500 font-bold">Quedan {product.stock}</div>
          )}
        </div>
      </div>
    </button>
  );
}
