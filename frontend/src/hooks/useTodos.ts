import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { todosService } from '../services/todos.service';
import type { CreateTodoInput, TodoFilter, UpdateTodoInput } from '../types';

export const TODO_KEYS = {
    all: ['todos'] as const,
    list: (filter: TodoFilter) => ['todos', 'list', filter] as const,
    detail: (id: string) => ['todos', id] as const,
};

export function useTodos(filter: TodoFilter = {}) {
    return useQuery({
        queryKey: TODO_KEYS.list(filter),
        queryFn: () => todosService.list(filter),
    });
}

export function useTodo(id: string) {
    return useQuery({
        queryKey: TODO_KEYS.detail(id),
        queryFn: () => todosService.get(id),
        enabled: !!id,
    });
}

export function useCreateTodo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTodoInput) => todosService.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: TODO_KEYS.all });
            toast.success('Todo created!');
        },
        onError: () => toast.error('Failed to create todo'),
    });
}

export function useUpdateTodo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTodoInput }) =>
            todosService.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: TODO_KEYS.all });
            toast.success('Todo updated!');
        },
        onError: () => toast.error('Failed to update todo'),
    });
}

export function useDeleteTodo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => todosService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: TODO_KEYS.all });
            toast.success('Todo deleted');
        },
        onError: () => toast.error('Failed to delete todo'),
    });
}

export function useUpdateTodoStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            todosService.updateStatus(id, status),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: TODO_KEYS.all });
        },
        onError: () => toast.error('Failed to update status'),
    });
}
