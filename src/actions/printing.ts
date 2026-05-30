import { invoke } from "@tauri-apps/api/core";
import type { PrintJob, PrinterConfig } from "@/types";

export const printingActions = {
  printReceipt: (saleId: string): Promise<PrintJob> =>
    invoke<PrintJob>("print_receipt", { saleId }),

  previewReceipt: (saleId: string): Promise<string> =>
    invoke<string>("preview_receipt", { saleId }),

  getPrintJobs: (): Promise<PrintJob[]> =>
    invoke<PrintJob[]>("get_print_jobs"),

  configurePrinter: (config: PrinterConfig): Promise<PrinterConfig> =>
    invoke<PrinterConfig>("configure_printer", { config }),

  getPrinterConfig: (): Promise<PrinterConfig> =>
    invoke<PrinterConfig>("get_printer_config"),
};
