import { useForm, getFormProps, getInputProps, getSelectProps } from "@conform-to/react";
import { QrCode, Save, X } from "lucide-preact";
import useSWR from "swr";
import { categoriesActions } from "@/actions/categories";
import { productActions } from "@/actions/products";
import { JSX } from "preact/jsx-runtime";
import { useAuthStore } from "@/store/authStore";
import { type ProductForm as TypeProductForm, productFormSchema } from "@/validators/product";
import { parseWithZod } from "@conform-to/zod/v4";
import { useState } from "preact/hooks";
import type { Product } from "@/types";

interface Props {
  product?: Product;
  setShowProductModal: (value: boolean) => void;
  onSuccess?: () => void;
}

export default function ProductForm({ product, setShowProductModal, onSuccess }: Props) {
  const { session } = useAuthStore();
  const {
    data: categoriesData,
    error,
    isLoading,
  } = useSWR("categories", () => categoriesActions.getCategories());

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, fields] = useForm<TypeProductForm>({
    defaultValue: {
      name: product?.name || "",
      category_id: product?.category_id || "",
      code: product?.code || "",
      stock: product?.stock || "",
      price: product?.price || "",
      cost: product?.cost || "",
      tax: product?.tax || "",
      createdBy: product ? undefined : session?.user_id, // Solo para productos nuevos
      updatedBy: product ? session?.user_id : undefined, // Solo para edición
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: productFormSchema });
    },
    async onSubmit(event, context) {
      event.preventDefault();

      if (!context.submission || context.submission.status !== "success") {
        return;
      }

      const formData = context.submission.value;
      setIsSaving(true);
      setSaveError(null);

      try {
        if (product) {
          // Actualizar producto existente
          await productActions.updateProduct(product.id, {
            name: formData.name,
            category_id: formData.category_id || null,
            code: formData.code,
            stock: formData.stock,
            price: formData.price,
            cost: formData.cost,
            tax: formData.tax,
            updated_by: session?.user_id || "",
          });
        } else {
          // Crear nuevo producto
          await productActions.createProduct({
            name: formData.name,
            category_id: formData.category_id || null,
            code: formData.code,
            stock: formData.stock,
            price: formData.price,
            cost: formData.cost,
            tax: formData.tax,
            created_by: session?.user_id || "",
          });
        }

        // Notificar éxito para revalidar la lista
        onSuccess?.();

        // Cerrar modal
        form.reset();
        setShowProductModal(false);
      } catch (error) {
        console.error("Error al guardar producto:", error);
        setSaveError(
          typeof error === "string" ? error : "Error al guardar el producto. Intenta nuevamente."
        );
      } finally {
        setIsSaving(false);
      }
    },
  });

  const handleCancel = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.reset();
    setShowProductModal(false);
  };

  const formProps = getFormProps(form);

  return (
    <>
      {/* Header del modal */}
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg text-gray-800">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Formulario */}
      <form
        {...formProps}
        className="p-6 space-y-4 overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          formProps.onSubmit?.(e as any);
        }}
      >
        {/* Error general del formulario */}
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Producto</label>
          <input
            required
            {...getInputProps(fields.name, { type: "text" })}
            className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ej. Galletas Marías"
          />
          {fields.name.errors && <p className="text-xs text-red-500 mt-1">{fields.name.errors}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Código / SKU</label>
            <div className="flex gap-2">
              <input
                required
                {...getInputProps(fields.code, { type: "text" })}
                className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
                placeholder="123456"
              />
              <button
                type="button"
                className="p-2 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200"
                title="Generar"
              >
                <QrCode size={18} className="text-gray-600" />
              </button>
            </div>
            {fields.code.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.code.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
            <select
              // defaultValue={product?.category || ""}
              {...(getSelectProps(fields.category_id) as any)}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none bg-white disabled:bg-gray-100"
              disabled={isLoading}
            >
              <option value="" selected>
                Seleccionar categoría...
              </option>
              {isLoading && <option value="">Cargando categorías...</option>}
              {error && <option value="">Error al cargar categorías</option>}
              {categoriesData?.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">Error al cargar las categorías</p>}
            {fields.category_id.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.category_id.errors}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Costo ($)</label>
            <input
              required
              step="0.01"
              {...getInputProps(fields.cost, { type: "number" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
              placeholder="0.00"
            />
            {fields.cost.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.cost.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Precio ($)</label>
            <input
              required
              step="0.01"
              {...getInputProps(fields.price, { type: "number" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
              placeholder="0.00"
            />
            {fields.price.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.price.errors}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Stock Inicial</label>
            <input
              required
              {...getInputProps(fields.stock, { type: "number" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
              placeholder="0"
            />
            {fields.stock.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.stock.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Impuesto (%)
              <span className="text-gray-400 font-normal ml-1 text-[10px]">
                Ej: 16 para IVA 16%
              </span>
            </label>
            <input
              step="0.01"
              {...getInputProps(fields.tax, { type: "number" })}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
              placeholder="0.00"
            />
            {fields.tax.errors && <p className="text-xs text-red-500 mt-1">{fields.tax.errors}</p>}
          </div>
        </div>
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="animate-spin">⏳</span> Guardando...
              </>
            ) : (
              <>
                <Save size={18} /> Guardar Producto
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
