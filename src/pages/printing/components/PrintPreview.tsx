import { X } from "lucide-preact";
import type { PrintJob } from "@/types";

interface PrintPreviewProps {
  job: PrintJob;
  onClose: () => void;
}

export default function PrintPreview({ job, onClose }: PrintPreviewProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Preview del Ticket</h2>
            <p className="text-xs text-gray-400 font-mono">{job.sale_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[70vh]">
          <pre className="text-xs font-mono text-gray-700 whitespace-pre bg-gray-50 p-4 rounded-lg overflow-x-auto leading-5">
            {job.preview_text}
          </pre>
        </div>

        {job.error && (
          <div className="px-4 pb-4">
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              Error: {job.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
