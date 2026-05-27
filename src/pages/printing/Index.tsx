import { useState } from "preact/hooks";
import useSWR from "swr";
import { Printer } from "lucide-preact";
import { printingActions } from "@/actions/printing";
import PrintJobsTable from "./components/PrintJobsTable";
import PrintPreview from "./components/PrintPreview";
import PrinterConfigForm from "./components/PrinterConfigForm";
import type { PrintJob } from "@/types";

type ActiveTab = "history" | "config";

export default function Index() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("history");
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [testSaleId, setTestSaleId] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  const { data: jobs = [], mutate } = useSWR("print_jobs", () =>
    printingActions.getPrintJobs()
  );

  const handlePrint = async (saleId: string) => {
    const id = saleId.trim();
    if (!id) return;
    setIsPrinting(true);
    setPrintError(null);
    try {
      await printingActions.printReceipt(id);
      await mutate();
    } catch (err) {
      setPrintError(String(err));
    } finally {
      setIsPrinting(false);
    }
  };

  const tabClass = (tab: ActiveTab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      activeTab === tab
        ? "bg-white border border-b-white text-primary-600 border-gray-200 -mb-px"
        : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Printer size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Impresión Térmica</h1>
            <p className="text-xs text-slate-500">ESC/POS — cola de impresión y configuración</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          <button className={tabClass("history")} onClick={() => setActiveTab("history")}>
            Historial
          </button>
          <button className={tabClass("config")} onClick={() => setActiveTab("config")}>
            Configuración
          </button>
        </div>
      </div>

      {activeTab === "history" && (
        <div className="flex-1 flex flex-col px-6 pt-4 pb-6 overflow-hidden">
          {/* Test print bar */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="ID de venta para imprimir…"
              value={testSaleId}
              onInput={(e) => setTestSaleId((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => e.key === "Enter" && handlePrint(testSaleId)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
            <button
              onClick={() => handlePrint(testSaleId)}
              disabled={isPrinting || !testSaleId.trim()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Printer size={15} />
              {isPrinting ? "Imprimiendo…" : "Imprimir"}
            </button>
          </div>

          {printError && (
            <p className="text-xs text-red-500 mb-3 px-3 py-2 bg-red-50 rounded-lg">
              {printError}
            </p>
          )}

          <PrintJobsTable
            jobs={jobs}
            onPreview={setSelectedJob}
            onReprint={(job) => handlePrint(job.sale_id)}
          />
        </div>
      )}

      {activeTab === "config" && (
        <div className="flex-1 px-6 pb-6 overflow-auto">
          <PrinterConfigForm />
        </div>
      )}

      {selectedJob && (
        <PrintPreview job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
