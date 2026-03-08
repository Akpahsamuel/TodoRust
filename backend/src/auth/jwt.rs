use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::errors::{AppError, Result};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String, // user uuid
    pub email: String,
    pub exp: i64,
    pub iat: i64,
    pub token_type: String, // "access" | "refresh"
}

pub fn generate_access_token(
    user_id: &Uuid,
    email: &str,
    secret: &str,
    expiry_minutes: i64,
) -> Result<String> {
    let now = Utc::now();
    let exp = (now + Duration::minutes(expiry_minutes)).timestamp();

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp,
        iat: now.timestamp(),
        token_type: "access".to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(AppError::Jwt)
}

pub fn generate_refresh_token(
    user_id: &Uuid,
    email: &str,
    secret: &str,
    expiry_days: i64,
) -> Result<String> {
    let now = Utc::now();
    let exp = (now + Duration::days(expiry_days)).timestamp();

    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp,
        iat: now.timestamp(),
        token_type: "refresh".to_string(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(AppError::Jwt)
}

pub fn decode_token(token: &str, secret: &str) -> Result<Claims> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|e| AppError::Unauthorized(format!("Invalid token: {}", e)))?;

    Ok(token_data.claims)
}

pub fn decode_access_token(token: &str, secret: &str) -> Result<Claims> {
    let claims = decode_token(token, secret)?;

    if claims.token_type != "access" {
        return Err(AppError::Unauthorized("Invalid token type".to_string()));
    }

    Ok(claims)
}

pub fn decode_refresh_token(token: &str, secret: &str) -> Result<Claims> {
    let claims = decode_token(token, secret)?;

    if claims.token_type != "refresh" {
        return Err(AppError::Unauthorized("Invalid token type".to_string()));
    }

    Ok(claims)
}
