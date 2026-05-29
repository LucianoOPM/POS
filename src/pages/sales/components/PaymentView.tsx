import { Banknote, ChevronRight, CreditCard, FileText, X } from "lucide-preact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentViewProps {
  total: number;
  selectedPayment: string;
  cashReceived: string;
  change: number;
  isProcessing: boolean;
  onCancel: () => void;
  onPaymentMethodChange: (method: string) => void;
  onCashReceivedChange: (value: string) => void;
  onConfirmPayment: () => void;
}

const paymentMethods = [
  { id: "cash", label: "Efectivo", icon: Banknote },
  { id: "card", label: "Tarjeta", icon: CreditCard },
  { id: "voucher", label: "Vales", icon: FileText },
];

export default function PaymentView({
  total,
  selectedPayment,
  cashReceived,
  change,
  isProcessing,
  onCancel,
  onPaymentMethodChange,
  onCashReceivedChange,
  onConfirmPayment,
}: PaymentViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-slate-100 p-8 animate-in slide-in-from-left duration-300">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Finalizar Venta</h2>
          <Button
            variant="outline"
            onClick={onCancel}
            className="gap-2 text-secondary-600"
          >
            <X size={20} /> Cancelar (Esc)
          </Button>
        </div>

        <div className="flex gap-8 flex-1">
          <div className="w-1/3 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Método de Pago
            </p>
            {paymentMethods.map((method) => (
              <Button
                key={method.id}
                variant="outline"
                onClick={() => onPaymentMethodChange(method.id)}
                className={`w-full justify-start gap-4 p-4 h-auto rounded-xl border-2 transition-all text-left ${
                  selectedPayment === method.id
                    ? "border-primary-500 bg-white text-primary-600 shadow-md scale-105"
                    : "border-transparent bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <method.icon size={24} />
                <span className="font-bold">{method.label}</span>
              </Button>
            ))}
          </div>

          <Card className="flex-1 shadow-lg border-gray-200">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="text-center mb-8">
                <p className="text-gray-500 text-lg mb-1">Total a Cobrar</p>
                <p className="text-6xl font-black text-primary-600 tracking-tight">
                  ${total.toFixed(2)}
                </p>
              </div>

              {selectedPayment === "cash" ? (
                <div className="space-y-6 max-w-sm mx-auto w-full">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Efectivo Recibido
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl font-bold z-10">
                        $
                      </span>
                      <Input
                        autoFocus
                        type="number"
                        value={cashReceived}
                        onChange={(e: Event) => onCashReceivedChange((e.target as HTMLInputElement).value)}
                        className="pl-10 pr-4 py-4 h-auto text-3xl font-bold text-gray-900 border-2 border-gray-300 rounded-xl focus-visible:border-primary-500 focus-visible:ring-0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[20, 50, 100, 200, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => onCashReceivedChange(amount.toString())}
                        className="font-bold text-sm"
                      >
                        ${amount}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCashReceivedChange(total.toFixed(2))}
                      className="col-span-3 font-bold text-sm bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100"
                    >
                      Exacto
                    </Button>
                  </div>

                  <div
                    className={`p-4 rounded-xl flex justify-between items-center ${
                      change >= 0 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                  >
                    <span className="font-bold text-lg">Cambio</span>
                    <span className="font-black text-2xl">
                      ${change >= 0 ? change.toFixed(2) : "---"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                  <CreditCard size={64} className="mb-4 text-secondary-500" />
                  <p className="text-xl font-bold">Esperando Terminal...</p>
                </div>
              )}

              <div className="mt-auto pt-8">
                <Button
                  variant="brand"
                  size="lg"
                  onClick={onConfirmPayment}
                  disabled={(selectedPayment === "cash" && change < 0) || isProcessing}
                  className="w-full rounded-xl text-xl py-4 h-auto gap-3"
                >
                  {isProcessing ? "Procesando..." : "Confirmar Pago"}
                  {!isProcessing && <ChevronRight size={24} strokeWidth={3} />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
