use sea_orm::{Database, DatabaseConnection, DbErr};

pub async fn get_connection(url_connection: &str) -> Result<DatabaseConnection, DbErr> {
    let db_connection = Database::connect(url_connection).await?;
    Ok(db_connection)
}
