use std::net::SocketAddr;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use todo_backend::{config::Config, db::create_pool, routes::app_router, AppState};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load config
    let config = Config::from_env()?;
    let port = config.port;

    tracing::info!("Connecting to database...");
    let db = create_pool(&config).await?;

    // Run migrations
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations").run(&db).await?;
    tracing::info!("Migrations complete.");

    // Create WebSocket broadcast channel (capacity = 1024)
    let (ws_tx, _) = broadcast::channel::<String>(1024);

    let state = AppState {
        db,
        config,
        ws_tx: Some(ws_tx),
    };

    // Build CORS layer - allow all origins for development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = app_router(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("🚀 Server listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
