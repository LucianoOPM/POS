import { useState, useMemo } from "preact/hooks";
import useSWR, { mutate as globalMutate } from "swr";
import { productActions } from "@/actions/products";
import { categoriesActions } from "@/actions/categories";
import ProductForm from "./components/ProductForm";
import ProductsTable from "./components/ProductsTable";
import ProductsToolbar from "./components/ProductsToolbar";
import type { ProductsFilters } from "./components/ProductFilterDropdown";
import type { Product, ProductListResponse, CategoryListResponse } from "@/types";

export default function ProductsPage() {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductsFilters>({
    categories: [],
    activeStatus: "all",
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

  const handleOpenModal = (product: Product | null = null): void => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = (): void => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: number): Promise<void> => {
    if (!window.confirm("¿Eliminar producto permanentemente?")) return;
    try {
      await productActions.deleteProduct(id);
      mutate();
      globalMutate("low_stock");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const filteredProducts: Product[] = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.code.includes(search);
      if (!matchesSearch) return false;

      const matchesCategory =
        filters.categories.length === 0 ||
        (product.category_name !== null && filters.categories.includes(product.category_name));
      if (!matchesCategory) return false;

      if (filters.activeStatus === "active" && !product.is_active) return false;
      if (filters.activeStatus === "inactive" && product.is_active) return false;

      return true;
    });
  }, [products, search, filters]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Catálogo y configuración de productos</p>
      </div>

      <ProductsToolbar
        search={search}
        onSearchChange={setSearch}
        onCreateNew={() => handleOpenModal()}
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={categories}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <ProductsTable
          products={filteredProducts}
          onEditProduct={handleOpenModal}
          onDeleteProduct={handleDeleteProduct}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalItems={data?.total_items}
        />
      </div>

      {showProductModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductForm
              key={editingProduct?.id || "new"}
              product={editingProduct || undefined}
              setShowProductModal={handleCloseModal}
              onSuccess={() => {
                mutate();
                globalMutate("low_stock");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
