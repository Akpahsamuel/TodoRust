// Format seconds into human-readable duration
export function formatDuration(seconds: number | undefined | null): string {
    if (!seconds) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
}

// Calculate time elapsed for an in-progress task
export function getElapsedTime(startedAt: string | undefined): number {
    if (!startedAt) return 0;
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
}

// Format time elapsed for display
export function formatTimeElapsed(todo: {
    status: string;
    started_at?: string;
    completed_at?: string;
    time_elapsed_seconds?: number;
}): string {
    if (todo.status === 'completed' && todo.time_elapsed_seconds) {
        return formatDuration(todo.time_elapsed_seconds);
    }
    
    if (todo.status === 'in_progress' && todo.started_at) {
        const elapsed = getElapsedTime(todo.started_at);
        return formatDuration(elapsed);
    }
    
    return '—';
}
