use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Tag {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTagDto {
    #[validate(length(min = 1, max = 50))]
    pub name: String,
}
