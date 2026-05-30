use async_trait::async_trait;
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;
use super::PrinterAdapter;

#[derive(Debug)]
pub struct TcpAdapter {
    pub host: String,
    pub port: u16,
}

#[async_trait]
impl PrinterAdapter for TcpAdapter {
    async fn print(&self, data: &[u8]) -> Result<(), String> {
        let addr = format!("{}:{}", self.host, self.port);
        let mut stream = TcpStream::connect(&addr)
            .await
            .map_err(|e| format!("No se pudo conectar a la impresora en {}: {}", addr, e))?;
        stream
            .write_all(data)
            .await
            .map_err(|e| format!("Error enviando datos a la impresora: {}", e))?;
        Ok(())
    }

    fn name(&self) -> &str {
        "tcp"
    }
}
