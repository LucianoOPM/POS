export interface PrintJob {
  id: string;
  sale_id: string;
  status: "completed" | "failed";
  adapter: string;
  preview_text: string;
  created_at: string;
  error?: string;
  reprint: boolean;
  printed_by: string;
}

export interface PrinterConfig {
  adapter_type: "console" | "preview" | "tcp";
  paper_width: number;
  tcp_host?: string;
  tcp_port?: number;
  business_name: string;
}
