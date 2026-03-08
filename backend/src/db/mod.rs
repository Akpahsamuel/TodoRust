use crate::config::Config;
use crate::errors::Result;
use sqlx::PgPool;

pub async fn create_pool(config: &Config) -> Result<PgPool> {
    let pool = PgPool::connect(&config.database_url)
        .await
        .map_err(|e| crate::errors::AppError::Database(e))?;

    Ok(pool)
}
