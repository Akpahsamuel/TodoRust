// ── Auth ──────────────────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    name?: string;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface RegisterInput {
    email: string;
    password: string;
    name?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

// ── Todos ────────────────────────────────────────────────────
export type TodoStatus = 'pending' | 'in_progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
    id: string;
    user_id: string;
    category_id?: string;
    title: string;
    description?: string;
    status: TodoStatus;
    priority: TodoPriority;
    due_date?: string;
    position: number;
    started_at?: string;
    completed_at?: string;
    time_elapsed_seconds?: number;
    created_at: string;
    updated_at: string;
}

export interface TodoWithTags extends Todo {
    tags: Tag[];
}

export interface PaginatedTodos {
    items: TodoWithTags[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface CreateTodoInput {
    title: string;
    description?: string;
    status?: TodoStatus;
    priority?: TodoPriority;
    due_date?: string;
    category_id?: string;
    tag_ids?: string[];
}

export interface UpdateTodoInput {
    title?: string;
    description?: string;
    status?: TodoStatus;
    priority?: TodoPriority;
    due_date?: string;
    category_id?: string;
    tag_ids?: string[];
}

export interface TodoFilter {
    status?: TodoStatus;
    priority?: TodoPriority;
    category_id?: string;
    search?: string;
    page?: number;
    per_page?: number;
}

// ── Categories ───────────────────────────────────────────────
export interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface CreateCategoryInput {
    name: string;
    color?: string;
}

export interface UpdateCategoryInput {
    name?: string;
    color?: string;
}

// ── Tags ─────────────────────────────────────────────────────
export interface Tag {
    id: string;
    user_id: string;
    name: string;
}

export interface CreateTagInput {
    name: string;
}

// ── WebSocket Events ─────────────────────────────────────────
export type WsEvent =
    | { type: 'todo_created'; data: Todo }
    | { type: 'todo_updated'; data: Todo }
    | { type: 'todo_deleted'; id: string };
