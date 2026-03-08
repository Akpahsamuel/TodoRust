import { useState } from 'react';
import { Check, Trash2, Pencil, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate, isOverdue, priorityClass, priorityLabel, statusClass, statusLabel } from '../../utils';
import type { TodoWithTags } from '../../types';
import { useDeleteTodo, useUpdateTodoStatus } from '../../hooks/useTodos';
import { todoStatusOptions } from './constants';

interface TodoCardProps {
    todo: TodoWithTags;
    onEdit: (todo: TodoWithTags) => void;
}

export function TodoCard({ todo, onEdit }: TodoCardProps) {
    const [showStatus, setShowStatus] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const deleteTodo = useDeleteTodo();
    const updateStatus = useUpdateTodoStatus();
    const overdue = isOverdue(todo.due_date) && todo.status !== 'completed';
    const isDone = todo.status === 'completed';

    return (
        <div className={`card p-4 animate-fade-in transition-all duration-200 ${isDone ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => updateStatus.mutate({ id: todo.id, status: isDone ? 'pending' : 'completed' })}
                    className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                        borderColor: isDone ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                        background: isDone ? 'var(--accent)' : 'transparent',
                    }}
                >
                    {isDone && <Check size={12} color="#000" strokeWidth={3} />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title row — clickable to expand */}
                    <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => setIsExpanded(e => !e)}
                    >
                        <p className={`text-sm font-semibold leading-snug ${isDone ? 'line-through' : ''}`}
                            style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {todo.title}
                        </p>
                        {isExpanded
                            ? <ChevronUp size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            : <ChevronDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        }
                    </div>

                    {todo.description && (
                        <p
                            className={`mt-0.5 text-xs cursor-pointer ${isExpanded ? '' : 'line-clamp-2'}`}
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={() => setIsExpanded(e => !e)}
                        >
                            {todo.description}
                        </p>
                    )}

                    {/* Badges row — NOT part of expand click */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {/* Status */}
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowStatus(!showStatus); }}
                                className={`badge ${statusClass(todo.status)} gap-1 cursor-pointer hover:opacity-80`}
                                style={{ fontSize: '0.65rem' }}
                            >
                                {statusLabel(todo.status)}
                                <ChevronDown size={9} />
                            </button>
                            {showStatus && (
                                <div className="absolute top-7 left-0 z-20 rounded-2xl overflow-hidden shadow-2xl"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', minWidth: 130 }}>
                                    {todoStatusOptions.map((opt) => (
                                        <button key={opt.value}
                                            className="block w-full text-left px-3 py-2 text-xs font-medium hover:opacity-80 transition-opacity"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: todo.id, status: opt.value }); setShowStatus(false); }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Priority */}
                        <span className={`badge ${priorityClass(todo.priority)}`} style={{ fontSize: '0.65rem' }}>
                            {priorityLabel(todo.priority)}
                        </span>

                        {/* Tags */}
                        {todo.tags.map((tag) => (
                            <span key={tag.id} className="badge badge-surface" style={{ fontSize: '0.65rem' }}>
                                {tag.name}
                            </span>
                        ))}
                    </div>

                    {/* Due date */}
                    {todo.due_date && (
                        <div className="mt-2 flex items-center gap-1"
                            style={{ color: overdue ? 'var(--warm)' : 'var(--text-muted)', fontSize: '0.7rem' }}>
                            <Calendar size={10} />
                            <span>{overdue ? '⚠ Overdue · ' : ''}{formatDate(todo.due_date)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                        <Pencil size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTodo.mutate(todo.id); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}
