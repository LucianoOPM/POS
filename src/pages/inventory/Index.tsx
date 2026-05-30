import { useState, useMemo } from "preact/hooks";
import useSWR, { mutate as globalMutate } from "swr";
import { productActions } from "@/actions/products";
import { categoriesActions } from "@/actions/categories";
import StockTable from "./components/StockTable";
import InventoryToolbar from "./components/InventoryToolbar";
import InventoryStats from "./components/InventoryStats";
import MovementsView from "./components/MovementsView";
import ProductMovementsModal from "./components/ProductMovementsModal";
import MovementForm from "./components/MovementForm";
import type { Product, InventoryFilters, ProductListResponse, CategoryListResponse } from "@/types";

export default function Index() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [invSearch, setInvSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"stock" | "movements">("stock");
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    categories: [],
    stockStatus: [],
  });

  const { data, mutate } = useSWR<ProductListResponse>(
    ["products", currentPage + 1, pageSize],
    () => productActions.getProducts(currentPage + 1, pageSize)
  );

  const { data: categoriesData } = useSWR<CategoryListResponse>("categories", () =>
    categoriesActions.getCategories()
  );

  const products = data?.products ?? [];
  const totalPages = data?.total_pages ?? 0;
  const categories = categoriesData?.categories ?? [];

  const filteredInventory: Product[] = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(invSearch.toLowerCase()) ||
        product.code.includes(invSearch);
      if (!matchesSearch) return false;

      const matchesCategory =
        filters.categories.length === 0 ||
        (product.category_name !== null && filters.categories.includes(product.category_name));
      if (!matchesCategory) return false;

      if (filters.stockStatus.length > 0) {
        const stockMatches = filters.stockStatus.some((status) => {
          if (status === "optimal") return product.stock >= 10;
          if (status === "low") return product.stock > 0 && product.stock < 10;
          if (status === "out") return product.stock === 0;
          return false;
        });
        if (!stockMatches) return false;
      }

      return true;
    });
  }, [products, invSearch, filters]);

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const handleAdjustSuccess = (): void => {
    mutate();
    globalMutate("low_stock");
    setAdjustingProduct(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <InventoryStats products={products} />

      <div className="px-6 pt-4 pb-0 flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === "stock"
              ? "border-primary-500 text-primary-600 bg-white"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          Stock
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === "movements"
              ? "border-primary-500 text-primary-600 bg-white"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          Movimientos
        </button>
      </div>

      {activeTab === "movements" && <MovementsView />}

      {activeTab === "stock" && (
        <>
          <InventoryToolbar
            search={invSearch}
            onSearchChange={setInvSearch}
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={categories}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />

          <div className="flex-1 px-6 pb-6 overflow-hidden">
            <StockTable
              products={filteredInventory}
              onAdjust={setAdjustingProduct}
              onViewHistory={setHistoryProduct}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
              totalItems={data?.total_items}
            />
          </div>
        </>
      )}

      {adjustingProduct && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAdjustingProduct(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <MovementForm
              key={adjustingProduct.id}
              preselectedProductId={adjustingProduct.id}
              onClose={() => setAdjustingProduct(null)}
              onSuccess={handleAdjustSuccess}
            />
          </div>
        </div>
      )}

      {historyProduct && (
        <ProductMovementsModal
          productId={historyProduct.id}
          productName={historyProduct.name}
          onClose={() => setHistoryProduct(null)}
        />
      )}
    </div>
  );
}
