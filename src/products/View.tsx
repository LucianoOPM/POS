import { ProductsTable } from "@products/components/ProductTable";
import { ProductModal } from "@products/components/ProductModal";
import { useState } from "preact/hooks";
import type { Product } from "@/types/products";
import { useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const ProductsView = () => {
  const queryClient = useQueryClient();
  const [productStatus, setProductStatus] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleAdd = () => {
    setEditProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (idProduct: number) => {
    await invoke("delete_product", { idProduct });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleClose = () => {
    setShowModal(false);
    setEditProduct(null);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div class="w-full space-y-40">
      <div class="flex justify-between">
        <div>
          <h1 class="text-3xl font-bold text-primary-600">Products</h1>
        </div>
        <div class="flex gap-2">
          <button
            onClick={() => setProductStatus(!productStatus)}
            class="bg-primary-600  rounded-lg px-5 py-2.5 text-white hover:cursor-pointer hover:bg-primary-800"
          >
            {productStatus ? "Inactive" : "Active"}
          </button>
          <button
            onClick={handleAdd}
            class="bg-primary-600  rounded-lg px-5 py-2.5 text-white hover:cursor-pointer hover:bg-primary-800"
          >
            Nuevo Producto
          </button>
        </div>
      </div>

      <ProductsTable
        status={productStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ProductModal
        isOpen={showModal}
        onClose={handleClose}
        product={editProduct}
      />
    </div>
  );
};
