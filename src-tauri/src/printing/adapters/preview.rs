use async_trait::async_trait;
use super::PrinterAdapter;

/// No-op adapter — printing is a no-op; the preview text is stored in the PrintJob.
#[derive(Debug)]
pub struct PreviewAdapter;

#[async_trait]
impl PrinterAdapter for PreviewAdapter {
    async fn print(&self, _data: &[u8]) -> Result<(), String> {
        Ok(())
    }

    fn name(&self) -> &str {
        "preview"
    }
}
