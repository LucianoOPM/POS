import { Tag } from "lucide-preact";
import ProductCard from "./ProductCard";
import type { SalesProduct } from "@/types";

interface Props {
  products: SalesProduct[];
  addToCart: (product: SalesProduct) => void;
}

export default function ProductList({ products, addToCart }: Props) {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
        <button className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-white transition-all text-gray-400 hover:text-primary-600 h-32 group">
          <Tag size={24} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Manual</span>
        </button>
      </div>
    </div>
  );
}
