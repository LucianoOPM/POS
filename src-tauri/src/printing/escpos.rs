pub struct EscPosBuilder {
    bytes: Vec<u8>,
    text: String,
    pub width: usize,
}

impl EscPosBuilder {
    pub fn new(width: u8) -> Self {
        Self {
            bytes: Vec::new(),
            text: String::new(),
            width: width as usize,
        }
    }

    /// ESC @ — initialize printer (bytes only)
    pub fn init(&mut self) -> &mut Self {
        self.bytes.extend_from_slice(&[0x1B, 0x40]);
        self
    }

    /// ESC a 1 — center align (bytes only)
    pub fn align_center(&mut self) -> &mut Self {
        self.bytes.extend_from_slice(&[0x1B, 0x61, 0x01]);
        self
    }

    /// ESC a 0 — left align (bytes only)
    pub fn align_left(&mut self) -> &mut Self {
        self.bytes.extend_from_slice(&[0x1B, 0x61, 0x00]);
        self
    }

    /// ESC E 1 — bold on (bytes only)
    pub fn bold_on(&mut self) -> &mut Self {
        self.bytes.extend_from_slice(&[0x1B, 0x45, 0x01]);
        self
    }

    /// ESC E 0 — bold off (bytes only)
    pub fn bold_off(&mut self) -> &mut Self {
        self.bytes.extend_from_slice(&[0x1B, 0x45, 0x00]);
        self
    }

    /// Write a line with a trailing newline.
    pub fn line(&mut self, content: &str) -> &mut Self {
        self.bytes.extend_from_slice(content.as_bytes());
        self.bytes.push(0x0A);
        self.text.push_str(content);
        self.text.push('\n');
        self
    }

    /// Write a line centered within `width` (text: space-padded, bytes: ESC/POS text).
    pub fn line_centered(&mut self, content: &str) -> &mut Self {
        let w = self.width;
        let len = content.chars().count();
        let padded = if w > len {
            let pad = (w - len) / 2;
            format!("{}{}", " ".repeat(pad), content)
        } else {
            content.to_string()
        };
        self.bytes.extend_from_slice(padded.as_bytes());
        self.bytes.push(0x0A);
        self.text.push_str(&padded);
        self.text.push('\n');
        self
    }

    pub fn newline(&mut self) -> &mut Self {
        self.bytes.push(0x0A);
        self.text.push('\n');
        self
    }

    /// Full-width dashed separator.
    pub fn separator(&mut self) -> &mut Self {
        let w = self.width;
        self.line(&"-".repeat(w))
    }

    /// Full-width double separator.
    pub fn double_separator(&mut self) -> &mut Self {
        let w = self.width;
        self.line(&"=".repeat(w))
    }

    /// Two-column row: left-aligned key, right-aligned value.
    pub fn key_value(&mut self, key: &str, value: &str) -> &mut Self {
        let w = self.width;
        let key_w = w / 2;
        let val_w = w - key_w;
        let row = format!("{:<key_w$}{:>val_w$}", key, value, key_w = key_w, val_w = val_w);
        self.line(&row)
    }

    /// Four-column item row: name | qty | unit_price | line_total.
    pub fn item_row(&mut self, name: &str, qty: i32, unit_price: &str, line_total: &str) -> &mut Self {
        let w = self.width;
        let qty_w: usize = 4;
        let price_w: usize = 10;
        let total_w: usize = 10;
        let name_w = w.saturating_sub(qty_w + price_w + total_w);

        let name_trunc: String = name.chars().take(name_w).collect();
        let qty_str = format!("x{}", qty);
        let row = format!(
            "{:<name_w$}{:>qty_w$}{:>price_w$}{:>total_w$}",
            name_trunc,
            qty_str,
            unit_price,
            line_total,
            name_w = name_w,
            qty_w = qty_w,
            price_w = price_w,
            total_w = total_w,
        );
        self.line(&row)
    }

    /// GS V A — full paper cut.
    pub fn cut(&mut self) -> &mut Self {
        self.bytes.extend_from_slice(&[0x1D, 0x56, 0x41]);
        self.newline();
        self.newline();
        self
    }

    pub fn build(&self) -> Vec<u8> {
        self.bytes.clone()
    }

    pub fn build_text(&self) -> String {
        self.text.clone()
    }
}
