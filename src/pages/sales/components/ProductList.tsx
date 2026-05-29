import { Tag } from "lucide-preact";
import ProductCard from "./ProductCard";
import type { SalesProduct } from "@/types";
import { Button } from "@/components/ui/button";

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
        <Button
          variant="outline"
          className="flex-col h-32 border-2 border-dashed gap-2 text-sm text-gray-400 hover:text-primary-600 hover:border-primary-500 hover:bg-white rounded-lg"
        >
          <Tag size={24} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Manual</span>
        </Button>
      </div>
    </div>
  );
}
