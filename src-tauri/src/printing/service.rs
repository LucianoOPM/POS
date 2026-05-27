use super::{
    adapters::{console::ConsoleAdapter, preview::PreviewAdapter, tcp::TcpAdapter, PrinterAdapter},
    escpos::EscPosBuilder,
    structs::{PrintJob, PrinterConfig, ReceiptContent},
};

pub struct PrintService {
    adapter: Box<dyn PrinterAdapter>,
    config: PrinterConfig,
}

impl PrintService {
    pub fn new(config: PrinterConfig) -> Self {
        let adapter = build_adapter(&config);
        Self { adapter, config }
    }

    pub async fn print_receipt(
        &mut self,
        content: ReceiptContent,
        printed_by: String,
    ) -> Result<PrintJob, String> {
        let reprint = content.reprint;
        let preview_text = render_text(&self.config, &content);
        let bytes = render_bytes(&self.config, &content);
        let adapter_name = self.adapter.name().to_string();
        let sale_id = content.sale_id.clone();

        let job = match self.adapter.print(&bytes).await {
            Ok(()) => PrintJob::completed(sale_id, adapter_name, preview_text, reprint, printed_by),
            Err(e) => PrintJob::failed(sale_id, adapter_name, preview_text, e, reprint, printed_by),
        };

        Ok(job)
    }

    pub fn preview_receipt(&self, content: ReceiptContent) -> String {
        render_text(&self.config, &content)
    }

    pub fn set_config(&mut self, config: PrinterConfig) {
        self.adapter = build_adapter(&config);
        self.config = config;
    }

    pub fn get_config(&self) -> &PrinterConfig {
        &self.config
    }
}

fn build_adapter(config: &PrinterConfig) -> Box<dyn PrinterAdapter> {
    match config.adapter_type.as_str() {
        "preview" => Box::new(PreviewAdapter),
        "tcp" => {
            let host = config
                .tcp_host
                .clone()
                .unwrap_or_else(|| "127.0.0.1".to_string());
            let port = config.tcp_port.unwrap_or(9100);
            Box::new(TcpAdapter { host, port })
        }
        _ => Box::new(ConsoleAdapter),
    }
}

fn render_text(config: &PrinterConfig, content: &ReceiptContent) -> String {
    let mut b = EscPosBuilder::new(config.paper_width);
    build_receipt(&mut b, content);
    b.build_text()
}

fn render_bytes(config: &PrinterConfig, content: &ReceiptContent) -> Vec<u8> {
    let mut b = EscPosBuilder::new(config.paper_width);
    build_receipt(&mut b, content);
    b.build()
}

fn build_receipt(b: &mut EscPosBuilder, c: &ReceiptContent) {
    let w = b.width;
    let name_col = w.saturating_sub(24);

    b.init()
        .double_separator()
        .align_center()
        .bold_on()
        .line_centered(&c.business_name)
        .bold_off()
        .double_separator()
        .align_left()
        .line(&format!("Fecha:  {}", c.date))
        .line(&format!("Cajero: {}", c.cashier));

    if c.reprint {
        b.line("*** REIMPRESION ***");
    }

    let sale_id_display: String = c.sale_id.chars().take(16).collect();
    b.line(&format!("Venta:  {}", sale_id_display))
        .separator();

    let header = format!(
        "{:<name_w$}{:>4}{:>10}{:>10}",
        "PRODUCTO",
        "CANT",
        "PRECIO",
        "TOTAL",
        name_w = name_col,
    );
    b.line(&header).separator();

    for item in &c.items {
        b.item_row(&item.name, item.quantity, &item.unit_price, &item.line_total);
    }

    b.separator()
        .key_value("Subtotal:", &c.subtotal)
        .key_value("IVA:", &c.tax)
        .bold_on()
        .key_value("TOTAL:", &c.total)
        .bold_off()
        .separator()
        .line(&format!("Pago: {}", c.payment_method))
        .double_separator()
        .line_centered("Gracias por su compra")
        .double_separator()
        .newline()
        .newline()
        .cut();
}
