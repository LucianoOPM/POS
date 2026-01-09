import { CartItemRow } from "@/pages/sales/components/CardItemRow";
import SalesView from "./components/SalesView";
import PaymentView from "./components/PaymentView";
import TicketView from "./components/TicketView";
import { FileText, PauseCircle, QrCode, Trash2, X } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import type {
  CartItem as Cart,
  CreateSaleRequest,
  PaymentMethodResponse,
  SalesProduct,
} from "@/types";
import { salesActions } from "@/actions/sales";
import useSWR from "swr";

export default function Sales() {
  const [viewState, setViewState] = useState<string>("sales");
  const [cart, setCart] = useState<Cart[]>([]);
  const [cashReceived, setCashReceived] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("cash");
  const [createdSaleId, setCreatedSaleId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar payment methods
  const { data: paymentMethods } = useSWR<PaymentMethodResponse[]>(
    "payment_methods",
    salesActions.getPaymentMethods
  );

  // Mapear tipo de pago frontend a ID backend
  const getPaymentMethodId = (paymentType: string): number | null => {
    if (!paymentMethods) return null;

    const mapping: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta de Crédito",
      voucher: "Vales",
    };

    const methodName = mapping[paymentType];
    const method = paymentMethods.find((pm) => pm.name === methodName);
    return method?.id || null;
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxes = cart.reduce((acc, item) => acc + item.price * item.quantity * (item.tax / 100), 0);
  const total = subtotal + taxes;
  const change = (parseFloat(cashReceived) || 0) - total;

  const clearCart = () => {
    if (window.confirm("¿Seguro que deseas cancelar la venta actual?")) {
      setCart([]);
      setViewState("sales");
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
        return item;
      })
    );
  };

  const addToCart = (product: SalesProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePaymentStart = () => {
    if (cart.length === 0) return;
    setViewState("payment");
    setCashReceived("");
  };

  const handleFinalizeSale = async () => {
    // Validaciones
    if (selectedPayment === "cash" && change < 0) {
      setError("Efectivo insuficiente");
      return;
    }

    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }

    const paymentMethodId = getPaymentMethodId(selectedPayment);
    if (!paymentMethodId) {
      setError("Método de pago no disponible");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Construir request
      const request: CreateSaleRequest = {
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          tax_rate: item.tax / 100, // Convertir 16 a 0.16
        })),
        payment_method_id: paymentMethodId,
        subtotal: subtotal,
        total: total,
      };

      const response = await salesActions.createSale(request);

      // Éxito - mostrar ticket
      setCreatedSaleId(response.sale_id);
      setViewState("ticket");
    } catch (err) {
      console.error("Error creating sale:", err);
      setError(err instanceof Error ? err.message : String(err));
      setIsProcessing(false);
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setCashReceived("");
    setSelectedPayment("cash");
    setCreatedSaleId("");
    setError(null);
    setIsProcessing(false);
    setViewState("sales");
  };

  // Manejo de teclas especiales para payment view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - Volver a ventas (desde vista de pago)
      if (e.key === "Escape") {
        if (viewState === "payment") {
          setViewState("sales");
        }
      }

      // Enter - Confirmar pago (solo en vista de pago con cambio válido)
      if (e.key === "Enter") {
        if (viewState === "payment") {
          if (selectedPayment === "cash" && change >= 0) {
            handleFinalizeSale();
          } else if (selectedPayment !== "cash") {
            handleFinalizeSale();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewState, change, selectedPayment]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-1 right-1 text-white/80 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden">
        {/* === COLUMNA IZQUIERDA: WORKSPACE === */}
        {viewState === "sales" && (
          <SalesView cart={cart} onAddToCart={addToCart} onStartPayment={handlePaymentStart} />
        )}

        {viewState === "payment" && (
          <PaymentView
            total={total}
            selectedPayment={selectedPayment}
            cashReceived={cashReceived}
            change={change}
            isProcessing={isProcessing}
            onCancel={() => setViewState("sales")}
            onPaymentMethodChange={setSelectedPayment}
            onCashReceivedChange={setCashReceived}
            onConfirmPayment={handleFinalizeSale}
          />
        )}

        {viewState === "ticket" && <TicketView saleId={createdSaleId} onNewSale={handleNewSale} />}

        {/* === COLUMNA DERECHA: TICKET / CARRITO === */}
        {viewState !== "ticket" && (
          <section className="w-105 bg-white flex flex-col border-l border-gray-200 shadow-xl z-20">
            {/* Header del Ticket */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Resúmen de la venta</h2>
              </div>
              <div className="flex gap-2">
                <button
                  title="Agregar Nota"
                  className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-100 text-secondary-600"
                >
                  <FileText size={18} />
                </button>
                <button
                  title="Cancelar Venta"
                  onClick={clearCart}
                  className="p-2 bg-white border border-gray-200 rounded hover:bg-red-50 text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className={`flex-1 ${cart.length > 0 ? "overflow-y-auto" : "overflow-hidden"}`}>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <QrCode size={40} strokeWidth={1.5} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-medium text-slate-500">Ticket Vacío</p>
                  <p className="text-sm">Listo para escanear</p>
                </div>
              ) : (
                <div>
                  {cart.map((item, idx) => (
                    <CartItemRow
                      key={item.id}
                      index={idx}
                      item={item}
                      onUpdateQty={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
              <div className="h-4"></div>
            </div>

            {/* Resumen Financiero */}
            <div className="p-5 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="space-y-1 mb-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Impuestos</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-4 pt-3 border-t border-dashed border-gray-200">
                <span className="text-gray-800 font-bold text-lg">Total</span>
                <span className="text-primary-600 font-black text-4xl tracking-tight">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="col-span-1 flex flex-col items-center justify-center py-2 border border-secondary-500 text-secondary-600 rounded-lg font-bold hover:bg-gray-50 transition-colors text-xs">
                  <PauseCircle size={18} className="mb-1" />
                  Pausar
                </button>
                <button
                  onClick={handlePaymentStart}
                  disabled={cart.length === 0 || !paymentMethods}
                  className={`col-span-2 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white shadow-lg transform transition-all active:scale-95 ${
                    cart.length === 0 || !paymentMethods
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-primary-500 hover:bg-primary-600"
                  }`}
                >
                  COBRAR{" "}
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] ml-1">F1</span>
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
