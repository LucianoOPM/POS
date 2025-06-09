import { Modal } from "@/components/Modal";
import { Product } from "@/types/products";
import { FC, useEffect } from "preact/compat";
import { useForm } from "react-hook-form";
import { newProductSchema, NewProduct } from "@/products/schemas/newProduct";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/components/ErrorMessage";
import { invoke } from "@tauri-apps/api/core";
import { Plus } from "lucide-preact";

interface ProductModalProps {
  onClose: () => void;
  product: Product | null;
  isOpen: boolean; // <-- Agrega esta prop
}

const styles = {
  input: {
    default:
      "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500",
    error:
      "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500",
  },
  label: {
    default: "block mb-2 text-sm font-medium text-gray-900 dark:text-white",
    error: "block mb-2 text-sm font-medium text-red-500 dark:text-red-500",
    defaultCheckbox:
      "w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300",
    errorCheckbox:
      "w-full py-4 ms-2 text-sm font-medium text-red-500 dark:text-red-500",
  },
  checkbox: {
    default:
      "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600",
    error:
      "w-4 h-4 text-red-500 bg-gray-100 border-red-500 rounded-sm focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-red-500",
  },
};

export const ProductModal: FC<ProductModalProps> = ({
  onClose,
  product,
  isOpen,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewProduct>({
    resolver: zodResolver(newProductSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      stock: undefined,
      maxStock: undefined,
      isActive: false,
      price: undefined,
      barcode: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen && product) {
      reset({
        name: product.name,
        stock: product.stock,
        maxStock: product.max_stock,
        isActive: product.is_active,
        price: product.unit_price,
        barcode: product.bar_code,
        description: product.description,
      });
    } else if (isOpen && !product) {
      reset({
        name: undefined,
        stock: undefined,
        maxStock: undefined,
        isActive: false, // <-- aquí
        price: undefined,
        barcode: undefined,
        description: undefined,
      });
    } else if (!isOpen) {
      // Si el modal se cierra, limpia el formulario
      reset({
        name: undefined,
        stock: undefined,
        maxStock: undefined,
        isActive: false, // <-- aquí
        price: undefined,
        barcode: undefined,
        description: undefined,
      });
    }
  }, [isOpen, product, reset]);

  const submitNewProduct = async (data: NewProduct) => {
    const { name, stock, maxStock, isActive, price, barcode, description } =
      data;

    if (!product) {
      await invoke("create_product", {
        productData: {
          name,
          stock,
          max_stock: maxStock,
          is_active: isActive,
          unit_price: price,
          bar_code: barcode,
          description,
        },
      });
    } else {
      await invoke("update_product", {
        idProduct: product.id_product,
        updateData: {
          name,
          stock,
          max_stock: maxStock,
          is_active: isActive,
          unit_price: price,
          bar_code: barcode,
          description,
        },
      });
    }
    onClose();
  };
  // Header
  const header = (
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {product ? "Edit Product" : "Create New Product"}
    </h3>
  );

  // Body (el formulario)
  const body = (
    <form
      onSubmit={handleSubmit(submitNewProduct)}
      id="product-form"
      autoComplete="off"
    >
      <div class="grid gap-4 mb-4 grid-cols-2">
        {/* NAME LABEL */}
        <div class="col-span-2">
          <label
            for="name"
            class={errors.name ? styles.label.error : styles.label.default}
          >
            Name {<span class="text-red-500">*</span>}
          </label>
          <input
            type="text"
            {...register("name")}
            id="name"
            class={errors.name ? styles.input.error : styles.input.default}
            placeholder="Type product name"
            required
          />
          <ErrorMessage error={errors.name} />
        </div>
        {/* PRICE LABEL */}
        <div class="col-span-2">
          <label
            for="price"
            class={errors.price ? styles.label.error : styles.label.default}
          >
            Price
          </label>
          <input
            type="number"
            {...register("price")}
            id="price"
            step={0.01}
            class={errors.price ? styles.input.error : styles.input.default}
            placeholder="$2999"
            min={0}
            required
          />
          <ErrorMessage error={errors.price} />
        </div>
        {/* BARCODE LABEL */}
        <div class="col-span-2">
          <label
            htmlFor="barcode"
            class={errors.barcode ? styles.label.error : styles.label.default}
          >
            Barcode {<span class="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id="barcode"
            class={errors.barcode ? styles.input.error : styles.input.default}
            placeholder="Type product barcode"
            {...register("barcode")}
            required
          />
          <ErrorMessage error={errors.barcode} />
        </div>
        {/* STOCK LABEL */}
        <div className="col-span-2 md:col-span-1">
          <label
            htmlFor="stock"
            class={errors.stock ? styles.label.error : styles.label.default}
          >
            Stock
          </label>
          <input
            type="number"
            id="stock"
            min={0}
            class={errors.stock ? styles.input.error : styles.input.default}
            placeholder="Type product stock"
            {...register("stock")}
            required
          />
          <ErrorMessage error={errors.stock} />
        </div>
        {/* MAX STOCK LABEL */}
        <div className="col-span-2 md:col-span-1">
          <label
            htmlFor="maxStock"
            class={errors.maxStock ? styles.label.error : styles.label.default}
          >
            Max Stock
          </label>
          <input
            type="number"
            id="maxStock"
            min={0}
            class={errors.maxStock ? styles.input.error : styles.input.default}
            placeholder="Type product max stock"
            {...register("maxStock")}
            required
          />
          <ErrorMessage error={errors.maxStock} />
        </div>
        {/* IS ACTIVE LABEL */}
        <div className="col-span-2">
          <div class="flex items-center ps-4 border border-gray-200 rounded-sm">
            <input
              type="checkbox"
              id="bordered-checkbox-2"
              class={
                errors.isActive
                  ? styles.checkbox.error
                  : styles.checkbox.default
              }
              {...register("isActive")}
            />
            <label
              for="bordered-checkbox-2"
              class={
                errors.isActive
                  ? styles.label.errorCheckbox
                  : styles.label.defaultCheckbox
              }
            >
              Is Active
            </label>
          </div>
          <ErrorMessage error={errors.isActive} />
        </div>
        {/* DESCRIPTION LABEL */}
        <div class="col-span-2">
          <label
            for="description"
            class={
              errors.description ? styles.label.error : styles.label.default
            }
          >
            Product Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={4}
            class={`resize-none ${
              errors.description ? styles.input.error : styles.input.default
            }`}
            placeholder="Write product description here"
          />
          <ErrorMessage error={errors.description} />
        </div>
      </div>
    </form>
  );

  const footer = (
    <div class="flex justify-between">
      <button
        form="product-form"
        type="submit"
        class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 hover:cursor-pointer"
      >
        <Plus size={18} />
        {product ? "Update product" : "Add new product"}
      </button>
      <button
        type="button"
        class="text-white inline-flex items-center bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 hover:cursor-pointer"
        onClick={onClose}
      >
        Cancelar
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      body={body}
      footer={footer}
      backdropClose={true}
    />
  );
};
