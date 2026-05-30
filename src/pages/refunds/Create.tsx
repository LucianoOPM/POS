import { useState, useMemo } from "preact/hooks";
import useSWR from "swr";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Search,
  Package,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-preact";
import { refundActions } from "@/actions/refunds";
import type {
  RecentSale,
  SaleForRefund,
  SaleItemForRefund,
  CreateRefundRequest,
  RefundItemRequest,
} from "@/types/refund";

interface ItemSelection {
  product_id: number;
  quantity: number;
  selected: boolean;
}

export default function Create() {
  const [, setLocation] = useLocation();

  // Sale selection state
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const [manualSaleId, setManualSaleId] = useState<string>("");
  const [useManualInput, setUseManualInput] = useState<boolean>(false);

  // Form state
  const [reason, setReason] = useState<string>("");
  const [itemSelections, setItemSelections] = useState<Map<number, ItemSelection>>(new Map());
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch recent sales for dropdown
  const { data: recentSales, isLoading: loadingSales } = useSWR<RecentSale[]>(
    "recent-sales-for-refund",
    () => refundActions.getRecentSalesForRefund()
  );

  // Determine which sale ID to use
  const activeSaleId = useManualInput ? manualSaleId.trim() : selectedSaleId;

  // Fetch sale details when a sale is selected
  const {
    data: saleDetails,
    isLoading: loadingSaleDetails,
    error: saleError,
  } = useSWR<SaleForRefund>(
    activeSaleId ? ["sale-for-refund", activeSaleId] : null,
    () => refundActions.getSaleForRefund(activeSaleId),
    {
      onSuccess: (data) => {
        // Initialize item selections when sale is loaded
        const newSelections = new Map<number, ItemSelection>();
        data.items.forEach((item) => {
          if (item.refundable_quantity > 0) {
            newSelections.set(item.product_id, {
              product_id: item.product_id,
              quantity: 0,
              selected: false,
            });
          }
        });
        setItemSelections(newSelections);
        setSelectAll(false);
      },
      onError: () => {
        setItemSelections(new Map());
      },
    }
  );

  // Calculate totals
  const { selectedItems, totalRefundAmount } = useMemo(() => {
    if (!saleDetails) return { selectedItems: [], totalRefundAmount: 0 };

    const items: RefundItemRequest[] = [];
    let total = 0;

    saleDetails.items.forEach((item) => {
      const selection = itemSelections.get(item.product_id);
      if (selection && selection.selected && selection.quantity > 0) {
        const unitPrice = parseFloat(item.unit_price);
        const itemTotal = unitPrice * selection.quantity;
        total += itemTotal;
        items.push({
          product_id: item.product_id,
          quantity: selection.quantity,
          unit_price: unitPrice,
        });
      }
    });

    return { selectedItems: items, totalRefundAmount: total };
  }, [saleDetails, itemSelections]);

  // Handle item selection toggle
  const handleItemToggle = (item: SaleItemForRefund) => {
    setItemSelections((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(item.product_id);
      if (current) {
        newMap.set(item.product_id, {
          ...current,
          selected: !current.selected,
          quantity: !current.selected ? item.refundable_quantity : 0,
        });
      }
      return newMap;
    });
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, delta: number) => {
    const item = saleDetails?.items.find((i) => i.product_id === productId);
    if (!item) return;

    setItemSelections((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(productId);
      if (current) {
        const newQty = Math.max(0, Math.min(item.refundable_quantity, current.quantity + delta));
        newMap.set(productId, {
          ...current,
          quantity: newQty,
          selected: newQty > 0,
        });
      }
      return newMap;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!saleDetails) return;

    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    setItemSelections((prev) => {
      const newMap = new Map(prev);
      saleDetails.items.forEach((item) => {
        if (item.refundable_quantity > 0) {
          newMap.set(item.product_id, {
            product_id: item.product_id,
            quantity: newSelectAll ? item.refundable_quantity : 0,
            selected: newSelectAll,
          });
        }
      });
      return newMap;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!activeSaleId || selectedItems.length === 0 || !reason.trim()) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: CreateRefundRequest = {
        sale_id: activeSaleId,
        reason: reason.trim(),
        items: selectedItems,
      };

      await refundActions.createRefund(request);
      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        setLocation("/refunds");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedSaleId("");
    setManualSaleId("");
    setReason("");
    setItemSelections(new Map());
    setSelectAll(false);
    setError(null);
    setSuccess(false);
  };

  const canSubmit =
    activeSaleId && selectedItems.length > 0 && reason.trim().length > 0 && !isSubmitting;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/refunds")}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Nuevo Reembolso</h1>
            <p className="text-sm text-gray-500">
              Selecciona una venta y los productos a reembolsar
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={24} />
              <div>
                <p className="font-medium text-green-800">Reembolso creado exitosamente</p>
                <p className="text-sm text-green-600">Redirigiendo a la lista de reembolsos...</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Select Sale */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Receipt size={20} className="text-primary-500" />
                Paso 1: Seleccionar Venta
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Toggle between dropdown and manual input */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputMode"
                    checked={!useManualInput}
                    onChange={() => setUseManualInput(false)}
                    className="w-4 h-4 text-primary-500"
                  />
                  <span className="text-sm text-gray-700">Ventas recientes (última semana)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inputMode"
                    checked={useManualInput}
                    onChange={() => setUseManualInput(true)}
                    className="w-4 h-4 text-primary-500"
                  />
                  <span className="text-sm text-gray-700">Ingresar ID manualmente</span>
                </label>
              </div>

              {/* Dropdown or manual input */}
              {!useManualInput ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar venta
                  </label>
                  <select
                    value={selectedSaleId}
                    onChange={(e) => setSelectedSaleId((e.target as HTMLSelectElement).value)}
                    disabled={loadingSales}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                  >
                    <option value="">
                      {loadingSales ? "Cargando ventas..." : "Selecciona una venta"}
                    </option>
                    {recentSales?.map((sale) => (
                      <option key={sale.id} value={sale.id}>
                        {sale.id.slice(0, 8)}... | ${parseFloat(sale.total).toFixed(2)} |{" "}
                        {new Date(sale.created_at).toLocaleDateString("es-MX")} |{" "}
                        {sale.items_count} producto(s)
                        {sale.has_refunds && ` | Reembolsado: $${parseFloat(sale.refunded_amount).toFixed(2)}`}
                      </option>
                    ))}
                  </select>
                  {recentSales?.length === 0 && !loadingSales && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay ventas disponibles para reembolso en la última semana
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de la venta
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={manualSaleId}
                      onChange={(e) => setManualSaleId((e.target as HTMLInputElement).value)}
                      placeholder="Ingresa el ID completo de la venta"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Sale error */}
              {saleError && activeSaleId && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="text-amber-600" size={18} />
                  <p className="text-sm text-amber-700">
                    No se encontró la venta o no está disponible para reembolso
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Products (only show when sale is loaded) */}
          {saleDetails && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package size={20} className="text-primary-500" />
                  Paso 2: Seleccionar Productos a Reembolsar
                </h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectAll ? "Deseleccionar todo" : "Seleccionar todo"}
                </button>
              </div>

              <div className="p-6">
                {/* Sale summary */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total de la Venta</p>
                    <p className="font-semibold text-gray-900">
                      ${parseFloat(saleDetails.total).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ya Reembolsado</p>
                    <p className="font-semibold text-red-600">
                      ${parseFloat(saleDetails.total_refunded).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Disponible para Reembolso</p>
                    <p className="font-semibold text-green-600">
                      ${parseFloat(saleDetails.refundable_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Products list */}
                {loadingSaleDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {saleDetails.items.map((item) => {
                      const selection = itemSelections.get(item.product_id);
                      const isSelected = selection?.selected || false;
                      const currentQty = selection?.quantity || 0;
                      const isDisabled = item.refundable_quantity === 0;

                      return (
                        <div
                          key={item.product_id}
                          className={`border rounded-lg p-4 transition-colors ${
                            isDisabled
                              ? "bg-gray-50 border-gray-200 opacity-60"
                              : isSelected
                                ? "border-primary-300 bg-primary-50"
                                : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => handleItemToggle(item)}
                              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                            />

                            {/* Product info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 truncate">
                                  {item.product_name}
                                </p>
                                <span className="text-xs text-gray-400 font-mono">
                                  {item.product_code}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span>Vendido: {item.quantity}</span>
                                {item.already_refunded > 0 && (
                                  <span className="text-amber-600">
                                    Reembolsado: {item.already_refunded}
                                  </span>
                                )}
                                <span className="text-green-600">
                                  Disponible: {item.refundable_quantity}
                                </span>
                                <span>@ ${parseFloat(item.unit_price).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Quantity controls */}
                            {!isDisabled && isSelected && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(item.product_id, -1)}
                                  disabled={currentQty <= 1}
                                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-12 text-center font-medium">{currentQty}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.product_id, 1)}
                                  disabled={currentQty >= item.refundable_quantity}
                                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            )}

                            {/* Item total */}
                            <div className="text-right w-24">
                              {isSelected && currentQty > 0 ? (
                                <p className="font-semibold text-red-600">
                                  -${(parseFloat(item.unit_price) * currentQty).toFixed(2)}
                                </p>
                              ) : (
                                <p className="text-gray-400">$0.00</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Reason and Submit */}
          {saleDetails && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-primary-500" />
                  Paso 3: Motivo del Reembolso
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo del reembolso <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason((e.target as HTMLTextAreaElement).value)}
                    placeholder="Describe el motivo del reembolso..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Productos seleccionados: {selectedItems.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total a reembolsar</p>
                      <p className="text-2xl font-bold text-red-600">
                        -${totalRefundAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={18} />
                      Limpiar
                    </button>
                    <button
                      onClick={() => setLocation("/refunds")}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Crear Reembolso
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
