import { FileText, FileSpreadsheet } from "lucide-preact";
import type { ExportFormat } from "@/types";

interface ExportButtonsProps {
  onExport: (format: ExportFormat) => void;
}

export default function ExportButtons({ onExport }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled
        title="Proximamente"
        onClick={() => onExport("pdf")}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-sm text-gray-400 cursor-not-allowed"
      >
        <FileText size={18} />
        <span>PDF</span>
      </button>

      <button
        type="button"
        disabled
        title="Proximamente"
        onClick={() => onExport("excel")}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-sm text-gray-400 cursor-not-allowed"
      >
        <FileSpreadsheet size={18} />
        <span>Excel</span>
      </button>
    </div>
  );
}
