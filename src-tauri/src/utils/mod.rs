/// Valida que el rango de fechas sea correcto
const INVALID_DATE_RANGE: &str = "El rango de fechas es inválido.";

pub fn validate_date_range(date_from: &str, date_to: &str) -> Result<(), &'static str> {
    if date_from > date_to {
        return Err(INVALID_DATE_RANGE);
    }
    Ok(())
}
