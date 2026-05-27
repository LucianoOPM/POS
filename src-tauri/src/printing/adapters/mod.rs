pub mod console;
pub mod preview;
pub mod tcp;

use async_trait::async_trait;
use std::fmt;

#[async_trait]
pub trait PrinterAdapter: Send + Sync + fmt::Debug {
    async fn print(&self, data: &[u8]) -> Result<(), String>;
    fn name(&self) -> &str;
}
