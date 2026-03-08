use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "todo_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum TodoStatus {
    Pending,
    #[sqlx(rename = "in_progress")]
    #[serde(rename = "in_progress")]
    InProgress,
    Completed,
}

impl TodoStatus {
    pub const fn as_db_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::InProgress => "in_progress",
            Self::Completed => "completed",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "todo_priority", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum TodoPriority {
    Low,
    Medium,
    High,
}

impl TodoPriority {
    pub const fn as_db_str(&self) -> &'static str {
        match self {
            Self::Low => "low",
            Self::Medium => "medium",
            Self::High => "high",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Todo {
    pub id: Uuid,
    pub user_id: Uuid,
    pub category_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub status: TodoStatus,
    pub priority: TodoPriority,
    pub due_date: Option<DateTime<Utc>>,
    pub position: i32,
    pub started_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub time_elapsed_seconds: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateTodoDto {
    #[validate(length(
        min = 1,
        max = 255,
        message = "Title must be between 1 and 255 characters"
    ))]
    pub title: String,
    pub description: Option<String>,
    pub status: Option<TodoStatus>,
    pub priority: Option<TodoPriority>,
    pub due_date: Option<DateTime<Utc>>,
    pub category_id: Option<Uuid>,
    pub tag_ids: Option<Vec<Uuid>>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateTodoDto {
    #[validate(length(min = 1, max = 255))]
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<TodoStatus>,
    pub priority: Option<TodoPriority>,
    pub due_date: Option<DateTime<Utc>>,
    pub category_id: Option<Uuid>,
    pub tag_ids: Option<Vec<Uuid>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusDto {
    pub status: TodoStatus,
}

#[derive(Debug, Deserialize)]
pub struct ReorderDto {
    pub position: i32,
}

#[derive(Debug, Deserialize, Default)]
pub struct TodoFilter {
    pub status: Option<String>,
    pub priority: Option<String>,
    pub category_id: Option<Uuid>,
    pub search: Option<String>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedTodos {
    pub items: Vec<TodoWithTags>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TodoWithTags {
    #[serde(flatten)]
    pub todo: Todo,
    pub tags: Vec<crate::models::tag::Tag>,
}

#[cfg(test)]
mod tests {
    use super::{TodoPriority, TodoStatus};

    #[test]
    fn todo_status_uses_database_enum_values() {
        assert_eq!(TodoStatus::Pending.as_db_str(), "pending");
        assert_eq!(TodoStatus::InProgress.as_db_str(), "in_progress");
        assert_eq!(TodoStatus::Completed.as_db_str(), "completed");
    }

    #[test]
    fn todo_priority_uses_database_enum_values() {
        assert_eq!(TodoPriority::Low.as_db_str(), "low");
        assert_eq!(TodoPriority::Medium.as_db_str(), "medium");
        assert_eq!(TodoPriority::High.as_db_str(), "high");
    }
}
