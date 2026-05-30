use async_trait::async_trait;
use super::PrinterAdapter;

#[derive(Debug)]
pub struct ConsoleAdapter;

#[async_trait]
impl PrinterAdapter for ConsoleAdapter {
    async fn print(&self, data: &[u8]) -> Result<(), String> {
        let text: String = data
            .iter()
            .filter_map(|&b| {
                if b == 0x0A {
                    Some('\n')
                } else if b >= 0x20 && b < 0x7F {
                    Some(b as char)
                } else {
                    None
                }
            })
            .collect();
        println!("{}", text);
        Ok(())
    }

    fn name(&self) -> &str {
        "console"
    }
}
