use axum::{
    extract::{Path, State},
    http::StatusCode,
    Extension, Json,
};
use uuid::Uuid;
use validator::Validate;

use crate::{
    errors::{AppError, Result},
    middleware::auth::AuthUser,
    models::category::{Category, CreateCategoryDto, UpdateCategoryDto},
    AppState,
};

pub async fn list_categories(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Category>>> {
    let categories = sqlx::query_as::<_, Category>(
        "SELECT id, user_id, name, color, created_at FROM categories WHERE user_id = $1 ORDER BY name ASC"
    )
    .bind(auth_user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(categories))
}

pub async fn create_category(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(body): Json<CreateCategoryDto>,
) -> Result<(StatusCode, Json<Category>)> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let category = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (user_id, name, color) VALUES ($1, $2, COALESCE($3, '#6366f1'))
         RETURNING id, user_id, name, color, created_at",
    )
    .bind(auth_user.id)
    .bind(&body.name)
    .bind(&body.color)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(category)))
}

pub async fn update_category(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateCategoryDto>,
) -> Result<Json<Category>> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let category = sqlx::query_as::<_, Category>(
        "UPDATE categories SET
            name = COALESCE($3, name),
            color = COALESCE($4, color)
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, name, color, created_at",
    )
    .bind(id)
    .bind(auth_user.id)
    .bind(&body.name)
    .bind(&body.color)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Category {} not found", id)))?;

    Ok(Json(category))
}

pub async fn delete_category(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode> {
    let result = sqlx::query("DELETE FROM categories WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(auth_user.id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Category {} not found", id)));
    }

    Ok(StatusCode::NO_CONTENT)
}
