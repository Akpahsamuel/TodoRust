import type { TodoStatus } from '../../types';

export const todoStatusOptions: { value: TodoStatus; label: string }[] = [
    { value: 'pending', label: '⬜ Pending' },
    { value: 'in_progress', label: '🔵 In Progress' },
    { value: 'completed', label: '✅ Completed' },
];

export const todoPriorityOptions = [
    { value: 'low', label: '🟢 Low' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'high', label: '🔴 High' },
];
