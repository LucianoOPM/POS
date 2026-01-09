import { useEffect, useRef, useState } from "preact/hooks";
import useSWR from "swr";
import { CATEGORIES } from "@/mocks/categories";
import { productActions } from "@/actions/products";
import SearchForm from "./SearchForm";
import CategoriesTags from "./CategoriesTags";
import ProductList from "./ProductList";
import type { SalesViewProps, ProductListResponse, SalesProduct } from "@/types";

export default function SalesView({ cart, onAddToCart, onStartPayment }: SalesViewProps) {
  // Estados internos de la vista de ventas
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScanned, setLastScanned] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cargar productos desde el backend con SWR
  const { data, isLoading } = useSWR<ProductListResponse>(["sales-products"], () =>
    productActions.getProducts(1, 100, true)
  );

  // Transformar productos del backend al formato de la vista
  const products: SalesProduct[] = (data?.products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    price: parseFloat(p.price),
    cost: parseFloat(p.cost),
    tax: parseFloat(p.tax),
    stock: p.stock,
    category: p.category_name ?? "otros",
  }));

  // Filtrar productos por categoría activa
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) => product.category.toLowerCase() === activeCategory.toLowerCase()
        );

  // Agregar producto al carrito con feedback visual
  const handleAddToCart = (product: SalesProduct) => {
    setLastScanned(product.id);
    setTimeout(() => setLastScanned(null), 500);
    onAddToCart(product);
    setSearchQuery("");
  };

  // Buscar producto por código
  const handleSearch = (e: Event) => {
    e.preventDefault();
    const exactMatch = products.find((p) => p.code === searchQuery || p.code.includes(searchQuery));
    if (exactMatch) {
      handleAddToCart(exactMatch);
    } else {
      alert("Producto no encontrado");
    }
  };

  // Keyboard shortcuts específicos de la vista de ventas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 - Cobrar (solo con carrito no vacío)
      if (e.key === "F1") {
        e.preventDefault();
        if (cart.length > 0) {
          onStartPayment();
        }
      }

      // F3 - Enfocar búsqueda
      if (e.key === "F3") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, onStartPayment]);

  return (
    <section className="flex-1 bg-slate-50 flex flex-col relative">
      <SearchForm
        handleSearch={handleSearch}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        lastScanned={lastScanned}
      />

      <CategoriesTags
        categories={CATEGORIES}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Cargando productos...</div>
        </div>
      ) : (
        <ProductList products={filteredProducts} addToCart={handleAddToCart} />
      )}
    </section>
  );
}
