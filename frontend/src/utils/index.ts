import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import type { TodoPriority, TodoStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
    try {
        return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
        return dateStr;
    }
}

export function formatRelative(dateStr: string): string {
    try {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
        return dateStr;
    }
}

export function isOverdue(dateStr?: string): boolean {
    if (!dateStr) return false;
    return isPast(new Date(dateStr));
}

export function priorityLabel(p: TodoPriority): string {
    return { low: 'Low', medium: 'Medium', high: 'High' }[p];
}

export function statusLabel(s: TodoStatus): string {
    return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[s];
}

export function priorityClass(p: TodoPriority): string {
    return { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' }[p];
}

export function statusClass(s: TodoStatus): string {
    return {
        pending: 'status-pending',
        in_progress: 'status-in_progress',
        completed: 'status-completed',
    }[s];
}

// Re-export time utilities
export { formatDuration, getElapsedTime, formatTimeElapsed } from './time';
