import { useForm, getFormProps, getInputProps, getSelectProps } from "@conform-to/react";
import { Save, X } from "lucide-preact";
import useSWR from "swr";
import { productActions } from "@/actions/products";
import { stockMovementActions } from "@/actions/stock_movements";
import { JSX } from "preact/jsx-runtime";
import { useAuthStore } from "@/store/authStore";
import { stockMovementSchema, type StockMovementFormValues } from "@/validators/stock_movement";
import { parseWithZod } from "@conform-to/zod/v4";
import { useState } from "preact/hooks";
import { mutate as globalMutate } from "swr";

const MOVEMENT_TYPE_OPTIONS = [
  { value: "entry", label: "Entrada" },
  { value: "exit", label: "Salida" },
  { value: "adjustment", label: "Ajuste" },
];

const REASON_OPTIONS = [
  { value: "purchase", label: "Compra" },
  { value: "loss", label: "Pérdida" },
  { value: "damaged", label: "Producto dañado" },
  { value: "return", label: "Devolución general" },
  { value: "manual_adjustment", label: "Ajuste manual" },
  { value: "supplier_return", label: "Devolución a proveedor" },
  { value: "sale_adjustment", label: "Ajuste por venta" },
  { value: "customer_refund", label: "Devolución de cliente" },
  { value: "other", label: "Otro" },
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  preselectedProductId?: number;
}

export default function MovementForm({ onClose, onSuccess, preselectedProductId }: Props) {
  const { session } = useAuthStore();
  const { data: productsData, isLoading: loadingProducts } = useSWR(
    ["products", 1, 500],
    () => productActions.getProducts(1, 500)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, fields] = useForm<StockMovementFormValues>({
    defaultValue: {
      product_id: preselectedProductId ?? undefined,
      movement_type: "entry",
      quantity: undefined,
      reason: "purchase",
      notes: "",
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onSubmit",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: stockMovementSchema });
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
        await stockMovementActions.createMovement({
          product_id: formData.product_id,
          movement_type: formData.movement_type,
          quantity: formData.quantity,
          reason: formData.reason,
          notes: formData.notes || undefined,
          created_by: session?.user_id || "",
        });

        onSuccess();
        globalMutate("low_stock");
        form.reset();
        onClose();
      } catch (error) {
        setSaveError(
          typeof error === "string" ? error : "Error al registrar el movimiento. Intenta nuevamente."
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
    onClose();
  };

  const formProps = getFormProps(form);

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg text-gray-800">Registrar Movimiento</h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form
        {...formProps}
        className="p-6 space-y-4 overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          formProps.onSubmit?.(e as any);
        }}
      >
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Producto</label>
          <select
            {...(getSelectProps(fields.product_id) as any)}
            className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none bg-white disabled:bg-gray-100"
            disabled={loadingProducts || !!preselectedProductId}
          >
            <option value="">Seleccionar producto...</option>
            {productsData?.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Stock: {p.stock}
              </option>
            ))}
          </select>
          {fields.product_id.errors && (
            <p className="text-xs text-red-500 mt-1">{fields.product_id.errors}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
            <select
              {...(getSelectProps(fields.movement_type) as any)}
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none bg-white"
            >
              {MOVEMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fields.movement_type.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.movement_type.errors}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Cantidad</label>
            <input
              required
              {...getInputProps(fields.quantity, { type: "number" })}
              min="1"
              className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none"
              placeholder="0"
            />
            {fields.quantity.errors && (
              <p className="text-xs text-red-500 mt-1">{fields.quantity.errors}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Motivo</label>
          <select
            {...(getSelectProps(fields.reason) as any)}
            className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none bg-white"
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {fields.reason.errors && (
            <p className="text-xs text-red-500 mt-1">{fields.reason.errors}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Notas
            <span className="text-gray-400 font-normal ml-1 text-[10px]">Opcional</span>
          </label>
          <textarea
            name={fields.notes.name}
            id={fields.notes.id}
            defaultValue={fields.notes.initialValue}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded focus:border-primary outline-none resize-none"
            placeholder="Observaciones adicionales..."
          />
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
                <Save size={18} /> Registrar Movimiento
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
