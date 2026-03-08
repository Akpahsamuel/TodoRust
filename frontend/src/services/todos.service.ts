import api from './api';
import type {
    CreateTodoInput,
    PaginatedTodos,
    Todo,
    TodoFilter,
    UpdateTodoInput,
} from '../types';

export const todosService = {
    async list(filter: TodoFilter = {}): Promise<PaginatedTodos> {
        const res = await api.get<PaginatedTodos>('/api/todos', { params: filter });
        return res.data;
    },

    async get(id: string): Promise<Todo> {
        const res = await api.get<Todo>(`/api/todos/${id}`);
        return res.data;
    },

    async create(data: CreateTodoInput): Promise<Todo> {
        const res = await api.post<Todo>('/api/todos', data);
        return res.data;
    },

    async update(id: string, data: UpdateTodoInput): Promise<Todo> {
        const res = await api.put<Todo>(`/api/todos/${id}`, data);
        return res.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/todos/${id}`);
    },

    async updateStatus(id: string, status: string): Promise<Todo> {
        const res = await api.patch<Todo>(`/api/todos/${id}/status`, { status });
        return res.data;
    },

    async reorder(id: string, position: number): Promise<Todo> {
        const res = await api.post<Todo>(`/api/todos/${id}/reorder`, { position });
        return res.data;
    },
};
