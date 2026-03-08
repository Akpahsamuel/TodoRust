import { Search, X } from 'lucide-react';
import type { TodoFilter, TodoPriority, TodoStatus } from '../../types';

interface FilterBarProps {
    filter: TodoFilter;
    onChange: (f: Partial<TodoFilter>) => void;
}

const statuses: { value: TodoStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const priorities: { value: TodoPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150"
            style={{
                background: active ? 'var(--accent)' : 'var(--surface-2)',
                color: active ? '#000' : 'var(--text-secondary)',
                border: active ? 'none' : '1px solid var(--border)',
                boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
            }}
        >
            {label}
        </button>
    );
}

export function TodoFilters({ filter, onChange }: FilterBarProps) {
    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                    value={filter.search ?? ''}
                    onChange={(e) => onChange({ search: e.target.value || undefined, page: 1 })}
                    placeholder="Search tasks..."
                    className="input pl-10"
                />
                {filter.search && (
                    <button onClick={() => onChange({ search: undefined })}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}>
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Status filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <FilterChip label="All" active={!filter.status}
                    onClick={() => onChange({ status: undefined, page: 1 })} />
                {statuses.map((s) => (
                    <FilterChip key={s.value} label={s.label}
                        active={filter.status === s.value}
                        onClick={() => onChange({ status: s.value === filter.status ? undefined : s.value, page: 1 })} />
                ))}
            </div>

            {/* Priority chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <FilterChip label="Any Priority" active={!filter.priority}
                    onClick={() => onChange({ priority: undefined, page: 1 })} />
                {priorities.map((p) => (
                    <FilterChip key={p.value} label={p.label}
                        active={filter.priority === p.value}
                        onClick={() => onChange({ priority: p.value === filter.priority ? undefined : p.value, page: 1 })} />
                ))}
            </div>
        </div>
    );
}
