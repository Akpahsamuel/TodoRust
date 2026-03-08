import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useTodos } from '../hooks/useTodos';
import { CheckCircle, Circle, Clock, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TodoCard } from '../components/todos/TodoCard';
import { TodoForm } from '../components/todos/TodoForm';
import type { TodoWithTags } from '../types';


export function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const [editingTodo, setEditingTodo] = useState<TodoWithTags | null>(null);
    const [showForm, setShowForm] = useState(false);
    const { data: allTodos, isLoading } = useTodos({ per_page: 100 });
    const { data: recentTodos } = useTodos({ per_page: 5 });

    const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

    const total = allTodos?.total ?? 0;
    const completed = allTodos?.items?.filter((t) => t.status === 'completed').length ?? 0;
    const inProgress = allTodos?.items?.filter((t) => t.status === 'in_progress').length ?? 0;
    const pending = allTodos?.items?.filter((t) => t.status === 'pending').length ?? 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="px-5 pb-8 max-w-2xl mx-auto lg:max-w-none lg:px-8">
            {/* Greeting */}
            <div className="mb-8 animate-fade-in">
                <p className="text-sm font-semibold tracking-widest uppercase mb-1"
                    style={{ color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="text-4xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                    Hello, <span style={{ color: 'var(--accent)' }}>{firstName}</span> 👋
                </h1>
                <p className="mt-1 text-base" style={{ color: 'var(--text-secondary)' }}>
                    {pending > 0 ? `You have ${pending} pending task${pending > 1 ? 's' : ''} today` : 'All caught up!'}
                </p>
            </div>

            {/* Big progress card */}
            <div className="card card-accent p-6 mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(0,0,0,0.5)' }}>
                            Overall Progress
                        </p>
                        <p className="text-4xl font-black text-black mt-1">{progress}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.12)' }}>
                        <Zap size={22} color="#000" fill="#000" />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: 'rgba(0,0,0,0.5)' }} />
                </div>

                <p className="mt-2 text-xs font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    {completed} of {total} tasks completed
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {[
                    { label: 'Pending', value: pending, icon: Circle, color: 'var(--text-secondary)', bg: 'var(--surface-2)' },
                    { label: 'In Progress', value: inProgress, icon: Clock, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
                    { label: 'Done', value: completed, icon: CheckCircle, color: 'var(--accent)', bg: 'var(--accent-dim)' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="card p-4 flex flex-col items-center" style={{ background: bg }}>
                        <Icon size={20} style={{ color }} strokeWidth={2} />
                        <p className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Recent tasks */}
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-black tracking-tight">Recent Tasks</h2>
                    <Link to="/todos" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                        View all <ChevronRight size={14} />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
                    </div>
                ) : recentTodos?.items?.length === 0 ? (
                    <div className="card p-8 text-center">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No tasks yet. Create one!</p>
                        <Link to="/todos" className="btn-accent mt-4 inline-flex text-xs px-5 py-2.5">
                            + New Task
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentTodos?.items?.map((todo) => (
                            <TodoCard
                                key={todo.id}
                                todo={todo}
                                onEdit={(t) => { setEditingTodo(t); setShowForm(true); }}
                            />
                        ))}
                    </div>
                )}

                {showForm && (
                    <TodoForm
                        todo={editingTodo}
                        onClose={() => { setShowForm(false); setEditingTodo(null); }}
                    />
                )}
            </div>
        </div>
    );
}
