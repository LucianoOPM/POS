import { Eye, Printer, CheckCircle, XCircle, RefreshCw } from "lucide-preact";
import type { PrintJob } from "@/types";

interface PrintJobsTableProps {
  jobs: PrintJob[];
  onPreview: (job: PrintJob) => void;
  onReprint: (job: PrintJob) => void;
}

export default function PrintJobsTable({ jobs, onPreview, onReprint }: PrintJobsTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Printer size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No hay trabajos de impresión</p>
          <p className="text-xs mt-1 text-gray-300">
            Ingresa un ID de venta y presiona Imprimir para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">ID Venta</th>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Adaptador</th>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Impreso por</th>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fecha</th>
            <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-600">
                    {job.sale_id.slice(0, 14)}…
                  </span>
                  {job.reprint && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      <RefreshCw size={9} />
                      REIMP.
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {job.status === "completed" ? (
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                    <CheckCircle size={14} />
                    Completado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                    <XCircle size={14} />
                    Fallido
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 capitalize">{job.adapter}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{job.printed_by}</td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(job.created_at).toLocaleString("es-MX")}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onPreview(job)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Ver preview"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => onReprint(job)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Reimprimir"
                  >
                    <Printer size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
