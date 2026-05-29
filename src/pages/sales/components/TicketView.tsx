import { FileText, Printer, QrCode, RotateCcw } from "lucide-preact";
import { useState } from "preact/hooks";
import { printingActions } from "@/actions/printing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TicketViewProps {
  saleId: string;
  onNewSale: () => void;
}

export default function TicketView({ saleId, onNewSale }: TicketViewProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printMsg, setPrintMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintMsg(null);
    try {
      await printingActions.printReceipt(saleId);
      setPrintMsg({ text: "Ticket enviado a la impresora.", ok: true });
    } catch (err) {
      setPrintMsg({ text: String(err), ok: false });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-8 animate-in zoom-in-95 duration-300">
      <Card className="max-w-md w-full text-center relative overflow-hidden shadow-xl">
        <div className="h-2 bg-green-500 absolute top-0 left-0 w-full" />
        <CardContent className="p-8 pt-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode size={32} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Venta Exitosa!</h2>
          <p className="text-gray-500 mb-4">
            El ticket #{saleId.slice(-8).toUpperCase()} ha sido generado.
          </p>

          {printMsg && (
            <p
              className={`text-xs mb-4 px-3 py-2 rounded-lg ${
                printMsg.ok ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"
              }`}
            >
              {printMsg.text}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 gap-2 py-3 h-auto"
              >
                <Printer size={18} />
                {isPrinting ? "Imprimiendo…" : "Imprimir"}
              </Button>
              <Button variant="outline" className="flex-1 gap-2 py-3 h-auto">
                <FileText size={18} /> Facturar
              </Button>
            </div>

            <Button
              variant="brand"
              onClick={onNewSale}
              className="w-full gap-2 py-4 h-auto rounded-lg"
            >
              <RotateCcw size={18} /> Nueva Venta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
