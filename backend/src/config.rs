use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub jwt_refresh_secret: String,
    pub jwt_access_expiry_minutes: i64,
    pub jwt_refresh_expiry_days: i64,
    pub port: u16,
    pub frontend_url: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        dotenvy::dotenv().ok();

        Ok(Config {
            database_url: env::var("DATABASE_URL")
                .map_err(|_| anyhow::anyhow!("DATABASE_URL must be set"))?,
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".into()),
            jwt_secret: env::var("JWT_SECRET")
                .map_err(|_| anyhow::anyhow!("JWT_SECRET must be set"))?,
            jwt_refresh_secret: env::var("JWT_REFRESH_SECRET")
                .map_err(|_| anyhow::anyhow!("JWT_REFRESH_SECRET must be set"))?,
            jwt_access_expiry_minutes: env::var("JWT_ACCESS_EXPIRY_MINUTES")
                .unwrap_or_else(|_| "15".into())
                .parse()
                .unwrap_or(15),
            jwt_refresh_expiry_days: env::var("JWT_REFRESH_EXPIRY_DAYS")
                .unwrap_or_else(|_| "30".into())
                .parse()
                .unwrap_or(30),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".into())
                .parse()
                .unwrap_or(8080),
            frontend_url: env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "https://todorust-mhsm.onrender.com".into()),
        })
    }
}
