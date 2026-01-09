import { useState, useMemo } from "preact/hooks";
import useSWR from "swr";
import { productActions } from "@/actions/products";
import { categoriesActions } from "@/actions/categories";
import { useAuthStore } from "@/store/authStore";
import ProductForm from "./components/ProductForm";
import InventoryTable from "@/pages/inventory/components/InventoryTable";
import InventoryToolbar from "./components/InventoryToolbar";
import InventoryStats from "./components/InventoryStats";
import type { Product, InventoryFilters, ProductListResponse, CategoryListResponse } from "@/types";

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [invSearch, setInvSearch] = useState<string>("");
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    categories: [],
    stockStatus: [],
  });

  // Cargar productos del backend con paginación
  const { data, mutate } = useSWR<ProductListResponse>(
    ["products", currentPage + 1, pageSize],
    () => productActions.getProducts(currentPage + 1, pageSize)
  );

  // Cargar categorías del backend
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

  // Lógica de filtrado con useMemo para optimización
  const filteredInventory: Product[] = useMemo(() => {
    return products.filter((product) => {
      // Filtro de búsqueda
      const matchesSearch =
        product.name.toLowerCase().includes(invSearch.toLowerCase()) ||
        product.code.includes(invSearch);

      if (!matchesSearch) return false;

      // Filtro de categorías
      const matchesCategory =
        filters.categories.length === 0 ||
        (product.category_name !== null && filters.categories.includes(product.category_name));

      if (!matchesCategory) return false;

      // Filtro de estado de stock
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

  const handleQuickStock = async (id: number, delta: number): Promise<void> => {
    const product = products.find((p) => p.id === id);
    if (!product || !session) return;

    const newStock = Math.max(0, product.stock + delta);
    try {
      await productActions.updateProduct(id, {
        stock: newStock,
        updated_by: session.username,
      });
      mutate();
    } catch (error) {
      console.error("Error al actualizar stock:", error);
    }
  };

  const handleDeleteProduct = async (id: number): Promise<void> => {
    if (!window.confirm("¿Eliminar producto permanentemente?")) return;

    try {
      await productActions.deleteProduct(id);
      mutate();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(0); // Resetear a la primera página cuando cambie el tamaño
  };

  const handlePageChange = (newPage: number): void => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Stats Header */}
      <InventoryStats products={products} />

      {/* Toolbar */}
      <InventoryToolbar
        search={invSearch}
        onSearchChange={setInvSearch}
        onCreateNew={() => handleOpenModal()}
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={categories}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Table Area */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <InventoryTable
          products={filteredInventory}
          onEditProduct={handleOpenModal}
          onDeleteProduct={handleDeleteProduct}
          onQuickStock={handleQuickStock}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalItems={data?.total_items}
        />
      </div>

      {/* Modal Crear/Editar */}
      {showProductModal && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            // Solo cerrar si se hace click en el backdrop, no en el contenido
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
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
              onSuccess={mutate}
            />
          </div>
        </div>
      )}
    </div>
  );
}
