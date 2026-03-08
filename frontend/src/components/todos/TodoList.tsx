import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTodos } from '../../hooks/useTodos';
import { TodoCard } from './TodoCard';
import { TodoForm } from './TodoForm';
import { TodoFilters } from './TodoFilters';
import type { TodoFilter, TodoWithTags } from '../../types';

export function TodoList() {
    const [searchParams] = useSearchParams();
    const categoryFromUrl = searchParams.get('category') ?? undefined;
    const [filter, setFilter] = useState<TodoFilter>({ category_id: categoryFromUrl });

    useEffect(() => {
        setFilter((prev) => ({ ...prev, category_id: categoryFromUrl }));
    }, [categoryFromUrl]);
    const [editingTodo, setEditingTodo] = useState<TodoWithTags | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { data, isLoading } = useTodos(filter);

    const handleFilterChange = (patch: Partial<TodoFilter>) => {
        setFilter((prev) => ({ ...prev, ...patch }));
    };

    return (
        <div>
            <TodoFilters filter={filter} onChange={handleFilterChange} />

            <div className="mt-4 space-y-3">
                {isLoading && (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton h-24" />
                    ))
                )}

                {!isLoading && data?.items?.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'var(--surface-2)' }}>
                            <Plus size={24} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No tasks yet</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            Tap the + button to add your first task
                        </p>
                    </div>
                )}

                {data?.items?.map((todo) => (
                    <TodoCard key={todo.id} todo={todo} onEdit={(t) => { setEditingTodo(t); setShowForm(true); }} />
                ))}
            </div>

            {/* Pagination */}
            {data && data.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                        disabled={filter.page === 1 || !filter.page}
                        onClick={() => handleFilterChange({ page: (filter.page ?? 1) - 1 })}
                        className="btn-surface btn-sm"
                    >
                        Prev
                    </button>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {filter.page ?? 1} / {data.total_pages}
                    </span>
                    <button
                        disabled={(filter.page ?? 1) >= data.total_pages}
                        onClick={() => handleFilterChange({ page: (filter.page ?? 1) + 1 })}
                        className="btn-surface btn-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* FAB */}
            <button className="fab" onClick={() => { setEditingTodo(null); setShowForm(true); }}>
                <Plus size={24} strokeWidth={2.5} />
            </button>

            {/* Form modal */}
            {showForm && (
                <TodoForm
                    todo={editingTodo}
                    onClose={() => { setShowForm(false); setEditingTodo(null); }}
                />
            )}
        </div>
    );
}
