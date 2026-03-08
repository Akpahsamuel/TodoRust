use axum::{extract::State, http::StatusCode, Extension, Json};
use validator::Validate;

use crate::{
    auth::{
        jwt::{decode_refresh_token, generate_access_token, generate_refresh_token},
        password::{hash_password, verify_password},
    },
    errors::{AppError, Result},
    middleware::auth::AuthUser,
    models::user::{AuthResponse, LoginDto, RefreshTokenDto, RegisterDto, UserResponse},
    AppState,
};

pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterDto>,
) -> Result<(StatusCode, Json<AuthResponse>)> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Check if email already exists
    let existing = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM users WHERE email = $1")
        .bind(&body.email)
        .fetch_one(&state.db)
        .await?;

    if existing > 0 {
        return Err(AppError::Conflict("Email already registered".to_string()));
    }

    let password_hash = hash_password(&body.password)?;

    let user = sqlx::query_as::<_, crate::models::user::User>(
        "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)
         RETURNING id, email, password_hash, name, created_at, updated_at",
    )
    .bind(&body.email)
    .bind(&password_hash)
    .bind(&body.name)
    .fetch_one(&state.db)
    .await?;

    let access_token = generate_access_token(
        &user.id,
        &user.email,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;

    let refresh_token = generate_refresh_token(
        &user.id,
        &user.email,
        &state.config.jwt_refresh_secret,
        state.config.jwt_refresh_expiry_days,
    )?;

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            user: user.into(),
            access_token,
            refresh_token,
            token_type: "Bearer".to_string(),
            expires_in: state.config.jwt_access_expiry_minutes * 60,
        }),
    ))
}

pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginDto>,
) -> Result<Json<AuthResponse>> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let user = sqlx::query_as::<_, crate::models::user::User>(
        "SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1",
    )
    .bind(&body.email)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let valid = verify_password(&body.password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Unauthorized(
            "Invalid email or password".to_string(),
        ));
    }

    let access_token = generate_access_token(
        &user.id,
        &user.email,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;

    let refresh_token = generate_refresh_token(
        &user.id,
        &user.email,
        &state.config.jwt_refresh_secret,
        state.config.jwt_refresh_expiry_days,
    )?;

    Ok(Json(AuthResponse {
        user: user.into(),
        access_token,
        refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: state.config.jwt_access_expiry_minutes * 60,
    }))
}

pub async fn refresh(
    State(state): State<AppState>,
    Json(body): Json<RefreshTokenDto>,
) -> Result<Json<serde_json::Value>> {
    let claims = decode_refresh_token(&body.refresh_token, &state.config.jwt_refresh_secret)?;

    let user_id = uuid::Uuid::parse_str(&claims.sub)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    // Ensure user still exists
    let user = sqlx::query_as::<_, crate::models::user::User>(
        "SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE id = $1",
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::Unauthorized("User not found".to_string()))?;

    let access_token = generate_access_token(
        &user.id,
        &user.email,
        &state.config.jwt_secret,
        state.config.jwt_access_expiry_minutes,
    )?;

    let new_refresh_token = generate_refresh_token(
        &user.id,
        &user.email,
        &state.config.jwt_refresh_secret,
        state.config.jwt_refresh_expiry_days,
    )?;

    Ok(Json(serde_json::json!({
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "Bearer",
        "expires_in": state.config.jwt_access_expiry_minutes * 60,
    })))
}

pub async fn logout() -> Result<Json<serde_json::Value>> {
    // Client-side logout — tokens are stateless. With Redis, we'd blacklist here.
    Ok(Json(
        serde_json::json!({ "message": "Logged out successfully" }),
    ))
}

pub async fn me(
    Extension(auth_user): Extension<AuthUser>,
    State(state): State<AppState>,
) -> Result<Json<UserResponse>> {
    let user = sqlx::query_as::<_, crate::models::user::User>(
        "SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE id = $1",
    )
    .bind(auth_user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(user.into()))
}
