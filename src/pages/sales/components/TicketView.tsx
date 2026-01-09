import { FileText, Printer, QrCode, RotateCcw } from "lucide-preact";

interface TicketViewProps {
  saleId: string;
  onNewSale: () => void;
}

export default function TicketView({ saleId, onNewSale }: TicketViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-8 animate-in zoom-in-95 duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative overflow-hidden">
        <div className="h-2 bg-green-500 absolute top-0 left-0 w-full"></div>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <QrCode size={32} className="text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Venta Exitosa!</h2>
        <p className="text-gray-500 mb-8">
          El ticket #{saleId.slice(-8).toUpperCase()} ha sido generado.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 font-medium transition-colors">
              <Printer size={18} /> Imprimir
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 font-medium transition-colors">
              <FileText size={18} /> Facturar
            </button>
          </div>

          <button
            onClick={onNewSale}
            className="w-full py-4 bg-primary-500 text-white font-bold rounded-lg shadow hover:bg-primary-600 flex justify-center items-center gap-2"
          >
            <RotateCcw size={18} /> Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
}
