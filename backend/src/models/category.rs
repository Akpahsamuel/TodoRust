use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Category {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    pub color: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateCategoryDto {
    #[validate(length(min = 1, max = 50))]
    pub name: String,
    #[validate(length(
        min = 7,
        max = 7,
        message = "Color must be a valid hex color (e.g. #6366f1)"
    ))]
    pub color: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateCategoryDto {
    #[validate(length(min = 1, max = 50))]
    pub name: Option<String>,
    #[validate(length(min = 7, max = 7))]
    pub color: Option<String>,
}
