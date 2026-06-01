import { useState } from "preact/hooks";
import { toast } from "sonner";
import { openPath } from "@tauri-apps/plugin-opener";

export function useExportReport(exportFn: () => Promise<string>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const filePath = await exportFn();
      const folder = filePath.includes("\\")
        ? filePath.substring(0, filePath.lastIndexOf("\\"))
        : filePath.substring(0, filePath.lastIndexOf("/"));
      toast.success("Reporte exportado correctamente", {
        description: filePath,
        action: {
          label: "Ver archivo",
          onClick: () => openPath(folder),
        },
      });
    } catch (err) {
      toast.error("Error al exportar el reporte", { description: String(err) });
    } finally {
      setExporting(false);
    }
  };

  return { exporting, handleExport };
}
