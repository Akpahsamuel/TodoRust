use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Extension, Json,
};
use uuid::Uuid;
use validator::Validate;

use crate::{
    errors::{AppError, Result},
    middleware::auth::AuthUser,
    models::tag::Tag,
    models::todo::{
        CreateTodoDto, PaginatedTodos, ReorderDto, Todo, TodoFilter, TodoPriority, TodoStatus,
        TodoWithTags, UpdateStatusDto, UpdateTodoDto,
    },
    AppState,
};

fn todo_status_param(status: Option<&TodoStatus>) -> Option<&'static str> {
    status.map(TodoStatus::as_db_str)
}

fn todo_priority_param(priority: Option<&TodoPriority>) -> Option<&'static str> {
    priority.map(TodoPriority::as_db_str)
}

pub async fn list_todos(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Query(filter): Query<TodoFilter>,
) -> Result<Json<PaginatedTodos>> {
    let page = filter.page.unwrap_or(1).max(1);
    let per_page = filter.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    // Build dynamic query
    let mut conditions = vec!["t.user_id = $1".to_string()];
    let mut param_index = 2_usize;

    if filter.status.is_some() {
        conditions.push(format!("t.status = ${param_index}::todo_status"));
        param_index += 1;
    }
    if filter.priority.is_some() {
        conditions.push(format!("t.priority = ${param_index}::todo_priority"));
        param_index += 1;
    }
    if filter.category_id.is_some() {
        conditions.push(format!("t.category_id = ${param_index}"));
        param_index += 1;
    }
    if filter.search.is_some() {
        conditions.push(format!(
            "(t.title ILIKE ${param_index} OR t.description ILIKE ${param_index})"
        ));
        param_index += 1;
    }

    let where_clause = conditions.join(" AND ");

    let count_sql = format!("SELECT COUNT(*) FROM todos t WHERE {where_clause}");
    let todos_sql = format!(
        "SELECT t.id, t.user_id, t.category_id, t.title, t.description, \
         t.status, t.priority, t.due_date, t.position, t.started_at, t.completed_at, \
         t.time_elapsed_seconds, t.created_at, t.updated_at \
         FROM todos t WHERE {where_clause} \
         ORDER BY t.position ASC, t.created_at DESC \
         LIMIT ${param_index} OFFSET ${}",
        param_index + 1
    );

    // Count query
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql).bind(auth_user.id);
    if let Some(ref s) = filter.status {
        count_q = count_q.bind(s);
    }
    if let Some(ref p) = filter.priority {
        count_q = count_q.bind(p);
    }
    if let Some(ref c) = filter.category_id {
        count_q = count_q.bind(c);
    }
    if let Some(ref s) = filter.search {
        count_q = count_q.bind(format!("%{}%", s));
    }

    let total = count_q.fetch_one(&state.db).await?;

    // Todos query
    let mut todos_q = sqlx::query_as::<_, Todo>(&todos_sql).bind(auth_user.id);
    if let Some(ref s) = filter.status {
        todos_q = todos_q.bind(s);
    }
    if let Some(ref p) = filter.priority {
        todos_q = todos_q.bind(p);
    }
    if let Some(ref c) = filter.category_id {
        todos_q = todos_q.bind(c);
    }
    if let Some(ref s) = filter.search {
        todos_q = todos_q.bind(format!("%{}%", s));
    }
    todos_q = todos_q.bind(per_page).bind(offset);

    let todos = todos_q.fetch_all(&state.db).await?;

    // Fetch tags for all todos
    let todo_ids: Vec<Uuid> = todos.iter().map(|t| t.id).collect();
    let tags_rows = if !todo_ids.is_empty() {
        sqlx::query_as::<_, (Uuid, Uuid, String)>(
            "SELECT tt.todo_id, tags.id, tags.name FROM tags \
             JOIN todo_tags tt ON tt.tag_id = tags.id \
             WHERE tt.todo_id = ANY($1)",
        )
        .bind(&todo_ids)
        .fetch_all(&state.db)
        .await?
    } else {
        vec![]
    };

    let todos_with_tags: Vec<TodoWithTags> = todos
        .into_iter()
        .map(|todo| {
            let tags = tags_rows
                .iter()
                .filter(|(tid, _, _)| *tid == todo.id)
                .map(|(_, id, name)| Tag {
                    id: *id,
                    user_id: auth_user.id,
                    name: name.clone(),
                })
                .collect();
            TodoWithTags { todo, tags }
        })
        .collect();

    let total_pages = (total + per_page - 1) / per_page;

    Ok(Json(PaginatedTodos {
        items: todos_with_tags,
        total,
        page,
        per_page,
        total_pages,
    }))
}

pub async fn create_todo(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(body): Json<CreateTodoDto>,
) -> Result<(StatusCode, Json<Todo>)> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Determine next position
    let max_pos: Option<i32> =
        sqlx::query_scalar("SELECT MAX(position) FROM todos WHERE user_id = $1")
            .bind(auth_user.id)
            .fetch_one(&state.db)
            .await?;

    let position = max_pos.map(|p| p + 1).unwrap_or(0);

    // Verify category belongs to the authenticated user
    if let Some(category_id) = body.category_id {
        let category_exists = sqlx::query_scalar::<_, Uuid>(
            "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
        )
        .bind(category_id)
        .bind(auth_user.id)
        .fetch_optional(&state.db)
        .await?;

        if category_exists.is_none() {
            return Err(AppError::Validation(format!(
                "Category {} not found or does not belong to you",
                category_id
            )));
        }
    }

    let status = body.status.as_ref().unwrap_or(&TodoStatus::Pending);
    let now = chrono::Utc::now();
    let started_at = if status == &TodoStatus::InProgress { Some(now) } else { None };
    let completed_at = if status == &TodoStatus::Completed { Some(now) } else { None };

    let todo = sqlx::query_as::<_, Todo>(
        "INSERT INTO todos (user_id, category_id, title, description, status, priority, due_date, position, started_at, completed_at)
         VALUES ($1, $2, $3, $4, COALESCE($5::todo_status, 'pending'), COALESCE($6::todo_priority, 'medium'), $7, $8, $9, $10)
         RETURNING id, user_id, category_id, title, description, status, priority, due_date, position, started_at, completed_at, time_elapsed_seconds, created_at, updated_at"
    )
    .bind(auth_user.id)
    .bind(body.category_id)
    .bind(&body.title)
    .bind(&body.description)
    .bind(todo_status_param(Some(status)))
    .bind(todo_priority_param(body.priority.as_ref()))
    .bind(body.due_date)
    .bind(position)
    .bind(started_at)
    .bind(completed_at)
    .fetch_one(&state.db)
    .await?;

    // Attach tags (verify each tag belongs to the authenticated user)
    if let Some(tag_ids) = body.tag_ids {
        for tag_id in tag_ids {
            let tag_exists = sqlx::query_scalar::<_, Uuid>(
                "SELECT id FROM tags WHERE id = $1 AND user_id = $2",
            )
            .bind(tag_id)
            .bind(auth_user.id)
            .fetch_optional(&state.db)
            .await?;

            if tag_exists.is_none() {
                return Err(AppError::Validation(format!(
                    "Tag {} not found or does not belong to you",
                    tag_id
                )));
            }

            sqlx::query(
                "INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            )
            .bind(todo.id)
            .bind(tag_id)
            .execute(&state.db)
            .await?;
        }
    }

    // Broadcast via WebSocket
    if let Some(tx) = &state.ws_tx {
        let msg = serde_json::json!({ "type": "todo_created", "user_id": auth_user.id.to_string(), "data": &todo });
        let _ = tx.send(msg.to_string());
    }

    Ok((StatusCode::CREATED, Json(todo)))
}

pub async fn get_todo(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<Json<Todo>> {
    let todo = sqlx::query_as::<_, Todo>(
        "SELECT id, user_id, category_id, title, description, status, priority, due_date, position, \
         started_at, completed_at, time_elapsed_seconds, created_at, updated_at \
         FROM todos WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(auth_user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Todo {} not found", id)))?;

    Ok(Json(todo))
}

pub async fn update_todo(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateTodoDto>,
) -> Result<Json<Todo>> {
    body.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Check ownership and get existing todo
    let existing = sqlx::query_as::<_, Todo>(
        "SELECT id, user_id, category_id, title, description, status, priority, due_date, position, \
         started_at, completed_at, time_elapsed_seconds, created_at, updated_at \
         FROM todos WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(auth_user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Todo {} not found", id)))?;

    // Verify category belongs to the authenticated user
    if let Some(category_id) = body.category_id {
        let category_exists = sqlx::query_scalar::<_, Uuid>(
            "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
        )
        .bind(category_id)
        .bind(auth_user.id)
        .fetch_optional(&state.db)
        .await?;

        if category_exists.is_none() {
            return Err(AppError::Validation(format!(
                "Category {} not found or does not belong to you",
                category_id
            )));
        }
    }

    // Handle time tracking based on status changes
    let mut time_tracking_updates = String::new();
    if let Some(new_status) = &body.status {
        match (existing.status.clone(), new_status) {
            // Started a task
            (TodoStatus::Pending, TodoStatus::InProgress) if existing.started_at.is_none() => {
                time_tracking_updates.push_str(", started_at = NOW()");
            }
            // Completed a task
            (_, TodoStatus::Completed) if existing.completed_at.is_none() => {
                time_tracking_updates.push_str(", completed_at = NOW()");
                if let Some(started) = existing.started_at {
                    let elapsed = (chrono::Utc::now() - started).num_seconds().max(0);
                    time_tracking_updates.push_str(&format!(
                        ", time_elapsed_seconds = {}",
                        elapsed
                    ));
                }
            }
            // Restarting a completed task - clear completion time
            (TodoStatus::Completed, TodoStatus::InProgress) | (TodoStatus::Completed, TodoStatus::Pending) => {
                time_tracking_updates.push_str(", completed_at = NULL");
                if new_status == &TodoStatus::InProgress && existing.started_at.is_none() {
                    time_tracking_updates.push_str(", started_at = NOW()");
                }
            }
            _ => {}
        }
    }

    let update_sql = format!(
        "UPDATE todos SET
            title = COALESCE($3, title),
            description = COALESCE($4, description),
            status = COALESCE($5::todo_status, status),
            priority = COALESCE($6::todo_priority, priority),
            due_date = COALESCE($7, due_date),
            category_id = COALESCE($8, category_id),
            updated_at = NOW()
            {}
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, category_id, title, description, status, priority, due_date, position, \
         started_at, completed_at, time_elapsed_seconds, created_at, updated_at",
        time_tracking_updates
    );

    let todo = sqlx::query_as::<_, Todo>(&update_sql)
    .bind(id)
    .bind(auth_user.id)
    .bind(&body.title)
    .bind(&body.description)
    .bind(todo_status_param(body.status.as_ref()))
    .bind(todo_priority_param(body.priority.as_ref()))
    .bind(body.due_date)
    .bind(body.category_id)
    .fetch_one(&state.db)
    .await?;

    // Verify and update tags if provided
    if let Some(tag_ids) = body.tag_ids {
        // Verify all tags belong to the authenticated user before making changes
        for tag_id in &tag_ids {
            let tag_exists = sqlx::query_scalar::<_, Uuid>(
                "SELECT id FROM tags WHERE id = $1 AND user_id = $2",
            )
            .bind(tag_id)
            .bind(auth_user.id)
            .fetch_optional(&state.db)
            .await?;

            if tag_exists.is_none() {
                return Err(AppError::Validation(format!(
                    "Tag {} not found or does not belong to you",
                    tag_id
                )));
            }
        }

        sqlx::query("DELETE FROM todo_tags WHERE todo_id = $1")
            .bind(id)
            .execute(&state.db)
            .await?;

        for tag_id in tag_ids {
            sqlx::query(
                "INSERT INTO todo_tags (todo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            )
            .bind(id)
            .bind(tag_id)
            .execute(&state.db)
            .await?;
        }
    }

    // Broadcast
    if let Some(tx) = &state.ws_tx {
        let msg = serde_json::json!({ "type": "todo_updated", "user_id": auth_user.id.to_string(), "data": &todo });
        let _ = tx.send(msg.to_string());
    }

    Ok(Json(todo))
}

pub async fn delete_todo(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode> {
    let result = sqlx::query("DELETE FROM todos WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(auth_user.id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound(format!("Todo {} not found", id)));
    }

    // Broadcast
    if let Some(tx) = &state.ws_tx {
        let msg = serde_json::json!({ "type": "todo_deleted", "user_id": auth_user.id.to_string(), "id": id });
        let _ = tx.send(msg.to_string());
    }

    Ok(StatusCode::NO_CONTENT)
}

pub async fn update_status(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateStatusDto>,
) -> Result<Json<Todo>> {
    // Get existing todo to check current status
    let existing = sqlx::query_as::<_, Todo>(
        "SELECT id, user_id, category_id, title, description, status, priority, due_date, position, \
         started_at, completed_at, time_elapsed_seconds, created_at, updated_at \
         FROM todos WHERE id = $1 AND user_id = $2"
    )
    .bind(id)
    .bind(auth_user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Todo {} not found", id)))?;

    // Handle time tracking based on status changes
    let mut time_tracking_updates = String::new();
    match (existing.status.clone(), &body.status) {
        // Started a task
        (TodoStatus::Pending, TodoStatus::InProgress) if existing.started_at.is_none() => {
            time_tracking_updates.push_str(", started_at = NOW()");
        }
        // Completed a task
        (_, TodoStatus::Completed) if existing.completed_at.is_none() => {
            time_tracking_updates.push_str(", completed_at = NOW()");
            if let Some(started) = existing.started_at {
                let elapsed = (chrono::Utc::now() - started).num_seconds().max(0);
                time_tracking_updates.push_str(&format!(
                    ", time_elapsed_seconds = {}",
                    elapsed
                ));
            }
        }
        // Restarting a completed task - clear completion time
        (TodoStatus::Completed, TodoStatus::InProgress) | (TodoStatus::Completed, TodoStatus::Pending) => {
            time_tracking_updates.push_str(", completed_at = NULL");
            if &body.status == &TodoStatus::InProgress && existing.started_at.is_none() {
                time_tracking_updates.push_str(", started_at = NOW()");
            }
        }
        _ => {}
    }

    let update_sql = format!(
        "UPDATE todos SET status = $3::todo_status, updated_at = NOW(){} \
         WHERE id = $1 AND user_id = $2 \
         RETURNING id, user_id, category_id, title, description, status, priority, due_date, position, \
         started_at, completed_at, time_elapsed_seconds, created_at, updated_at",
        time_tracking_updates
    );

    let todo = sqlx::query_as::<_, Todo>(&update_sql)
    .bind(id)
    .bind(auth_user.id)
    .bind(body.status.as_db_str())
    .fetch_one(&state.db)
    .await?;

    if let Some(tx) = &state.ws_tx {
        let msg = serde_json::json!({ "type": "todo_updated", "user_id": auth_user.id.to_string(), "data": &todo });
        let _ = tx.send(msg.to_string());
    }

    Ok(Json(todo))
}

pub async fn reorder_todo(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(id): Path<Uuid>,
    Json(body): Json<ReorderDto>,
) -> Result<Json<Todo>> {
    let todo = sqlx::query_as::<_, Todo>(
        "UPDATE todos SET position = $3, updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, category_id, title, description, status, priority, due_date, position, \
         started_at, completed_at, time_elapsed_seconds, created_at, updated_at"
    )
    .bind(id)
    .bind(auth_user.id)
    .bind(body.position)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Todo {} not found", id)))?;

    Ok(Json(todo))
}
