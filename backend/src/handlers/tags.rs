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
    models::tag::{CreateTagDto, Tag},
    AppState,
};

pub async fn list_tags(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> Result<Json<Vec<Tag>>> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT id, user_id, name FROM tags WHERE user_id = $1 ORDER BY name ASC",
    )
    .bind(auth_user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(tags))
}

pub async fn create_tag(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(body): Json<CreateTagDto>,
) -> Result<(StatusCode, Json<Tag>)> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let tag = sqlx::query_as::<_, Tag>(
        "INSERT INTO tags (user_id, name) VALUES ($1, $2)
         ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, user_id, name",
    )
    .bind(auth_user.id)
    .bind(&body.name)
    .fetch_one(&state.db)
    .await?;

    Ok((StatusCode::CREATED, Json(tag)))
}

pub async fn delete_tag(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode> {
    let result = sqlx::query("DELETE FROM tags WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(auth_user.id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Tag {} not found", id)));
    }

    Ok(StatusCode::NO_CONTENT)
}
