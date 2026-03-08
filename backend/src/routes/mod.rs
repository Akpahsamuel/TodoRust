use crate::{
    handlers::{
        auth as auth_handlers, categories as category_handlers, tags as tag_handlers,
        todos as todo_handlers, ws::ws_handler,
    },
    middleware::auth::require_auth,
    AppState,
};
use axum::{middleware, Router};

pub fn app_router(state: AppState) -> Router {
    let auth_routes = Router::new()
        .route("/register", axum::routing::post(auth_handlers::register))
        .route("/login", axum::routing::post(auth_handlers::login))
        .route("/refresh", axum::routing::post(auth_handlers::refresh))
        .route("/logout", axum::routing::post(auth_handlers::logout));

    let protected_auth_routes = Router::new()
        .route("/me", axum::routing::get(auth_handlers::me))
        .layer(middleware::from_fn_with_state(state.clone(), require_auth));

    let todo_routes = Router::new()
        .route(
            "/",
            axum::routing::get(todo_handlers::list_todos).post(todo_handlers::create_todo),
        )
        .route(
            "/:id",
            axum::routing::get(todo_handlers::get_todo)
                .put(todo_handlers::update_todo)
                .delete(todo_handlers::delete_todo),
        )
        .route(
            "/:id/status",
            axum::routing::patch(todo_handlers::update_status),
        )
        .route(
            "/:id/reorder",
            axum::routing::post(todo_handlers::reorder_todo),
        )
        .layer(middleware::from_fn_with_state(state.clone(), require_auth));

    let category_routes = Router::new()
        .route(
            "/",
            axum::routing::get(category_handlers::list_categories)
                .post(category_handlers::create_category),
        )
        .route(
            "/:id",
            axum::routing::put(category_handlers::update_category)
                .delete(category_handlers::delete_category),
        )
        .layer(middleware::from_fn_with_state(state.clone(), require_auth));

    let tag_routes = Router::new()
        .route(
            "/",
            axum::routing::get(tag_handlers::list_tags).post(tag_handlers::create_tag),
        )
        .route("/:id", axum::routing::delete(tag_handlers::delete_tag))
        .layer(middleware::from_fn_with_state(state.clone(), require_auth));

    Router::new()
        .nest("/api/auth", auth_routes)
        .nest("/api/auth", protected_auth_routes)
        .nest("/api/todos", todo_routes)
        .nest("/api/categories", category_routes)
        .nest("/api/tags", tag_routes)
        .route("/ws", axum::routing::get(ws_handler))
        .route("/health", axum::routing::get(|| async { "OK" }))
        .with_state(state)
}
