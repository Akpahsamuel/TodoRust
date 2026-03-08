import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useTodos } from '../hooks/useTodos';
import { MoreVertical, ChevronLeft, ChevronRight, Flame, Zap, Trophy } from 'lucide-react';
import { TodoForm } from '../components/todos/TodoForm';
import { useGamificationStore, xpForNextLevel, xpInCurrentLevel } from '../store/gamification.store';
import { useCountUp } from '../hooks/useGsap';
import gsap from 'gsap';
import type { TodoWithTags } from '../types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function getWeekDays(date: Date) {
    const day = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getStatusProgress(status: string) {
    if (status === 'completed') return 100;
    if (status === 'in_progress') return 50;
    return 15;
}

function getPriorityColor(priority: string) {
    if (priority === 'high') return '#f87171';
    if (priority === 'medium') return '#fbbf24';
    return '#34d399';
}

export function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [editingTodo, setEditingTodo] = useState<TodoWithTags | null>(null);
    const [showForm, setShowForm] = useState(false);

    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(today);
    const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

    const { data: allTodos } = useTodos({ per_page: 100 });

    const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';
    const userInitial = (user?.name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

    const { xp, level, streak, totalCompleted } = useGamificationStore();
    const currentLevelXp = xpInCurrentLevel(xp, level);
    const neededXp = xpForNextLevel(level);
    const levelProgress = neededXp > 0 ? (currentLevelXp / neededXp) * 100 : 0;

    const items = allTodos?.items ?? [];
    const pending = items.filter((t) => t.status === 'pending').length;
    const total = items.length;

    // Filter tasks for selected date (due that day, or all if no due_date)
    const dayTasks = useMemo(() => {
        return items.filter((t) => {
            if (!t.due_date) return isSameDay(selectedDate, today); // show undated tasks on today
            const due = new Date(t.due_date);
            return isSameDay(due, selectedDate);
        });
    }, [items, selectedDate, today]);

    // Count tasks with due dates per day in current week for dot indicators
    const weekTaskCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const t of items) {
            if (t.due_date) {
                const d = new Date(t.due_date);
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
        }
        return counts;
    }, [items]);

    // Animated stat counters
    const pendingCountRef = useCountUp(pending, 0.8);
    const inProgressCountRef = useCountUp(items.filter(t => t.status === 'in_progress').length, 0.8);
    const doneCountRef = useCountUp(items.filter(t => t.status === 'completed').length, 0.8);
    const statCountRefs = [pendingCountRef, inProgressCountRef, doneCountRef];

    // GSAP page entrance
    const pageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!pageRef.current) return;
        const ctx = gsap.context(() => {
            const sections = pageRef.current!.querySelectorAll('.dash-section');
            gsap.fromTo(sections,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: 'power3.out', clearProps: 'transform' },
            );
        }, pageRef);
        return () => ctx.revert();
    }, []);

    const shiftWeek = (dir: number) => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + dir * 7);
        setSelectedDate(next);
    };

    return (
        <div ref={pageRef} className="px-5 pb-28 max-w-2xl mx-auto lg:max-w-none lg:px-8">

            {/* ── Top Bar ───────────────────────────────────── */}
            <div className="dash-section flex items-center justify-between pt-14 pb-2">
                <button
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                    <MoreVertical size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
                <button
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    onClick={() => navigate('/settings')}
                    title="Profile"
                >
                    {userInitial}
                </button>
            </div>

            {/* ── Greeting ──────────────────────────────────── */}
            <div className="dash-section mt-6">
                <h1 className="text-4xl font-light leading-tight" style={{ color: 'var(--text-primary)' }}>
                    Hello, <span className="font-extrabold">{firstName}</span>
                </h1>
                <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {pending > 0
                        ? `${pending} Task${pending > 1 ? 's' : ''} are pending`
                        : total > 0 ? 'All caught up!' : 'No tasks yet — create one!'}
                </p>
            </div>

            {/* ── Streak & XP Bar ─────────────────────────────── */}
            <div className="dash-section mt-5 glass-card rounded-2xl p-4">
                <div className="flex items-center gap-4">
                    {/* Streak */}
                    <div className="flex items-center gap-1.5">
                        <Flame size={16} style={{ color: streak >= 3 ? 'var(--warm)' : 'var(--text-muted)' }} />
                        <span className="text-sm font-bold" style={{ color: streak >= 3 ? 'var(--warm)' : 'var(--text-primary)' }}>
                            {streak}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>day{streak !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

                    {/* Level + XP bar */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <Trophy size={12} style={{ color: 'var(--accent)' }} />
                                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Lvl {level}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap size={10} style={{ color: 'var(--accent)' }} />
                                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    {currentLevelXp}/{neededXp} XP
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${Math.min(levelProgress, 100)}%`,
                                    background: 'linear-gradient(90deg, var(--accent), var(--warm))',
                                    boxShadow: '0 0 8px var(--accent-glow)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Total completed */}
                    <div className="text-center pl-2">
                        <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{totalCompleted}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1 }}>done</p>
                    </div>
                </div>
            </div>

            {/* ── Calendar Card ───────────────────────────────── */}
            <div className="dash-section mt-4 rounded-3xl p-5 glass-card">
                {/* Date header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                            {isSameDay(selectedDate, today) ? 'Today' : DAY_NAMES[selectedDate.getDay()]}
                        </p>
                        <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                            {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => shiftWeek(-1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                            onClick={() => shiftWeek(1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    </div>
                </div>

                {/* Week day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((d, i) => (
                        <div key={i} className="text-center">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                {DAY_NAMES[d.getDay()]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Week day numbers */}
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((d, i) => {
                        const isSelected = isSameDay(d, selectedDate);
                        const isToday = isSameDay(d, today);
                        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                        const hasTasks = weekTaskCounts.has(key);

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(d)}
                                className="flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-200"
                                style={{
                                    background: isSelected
                                        ? 'var(--accent)'
                                        : isToday
                                            ? 'rgba(255,255,255,0.06)'
                                            : 'transparent',
                                    color: isSelected ? '#000' : 'var(--text-primary)',
                                }}
                            >
                                <span className="text-base font-bold">{d.getDate()}</span>
                                {hasTasks && !isSelected && (
                                    <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
                                )}
                                {hasTasks && isSelected && (
                                    <span className="w-1 h-1 rounded-full" style={{ background: '#000' }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Work for Today ───────────────────────────────── */}
            <div className="dash-section mt-8">
                <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {isSameDay(selectedDate, today) ? 'Work for Today' : `Tasks for ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
                </h2>

                {dayTasks.length === 0 ? (
                    <div
                        className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center"
                    >
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            No tasks for this day
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            Tap + to create one
                        </p>
                    </div>
                ) : (
                    <div
                        className="glass-card rounded-3xl p-5 space-y-4"
                    >
                        {dayTasks.map((todo, idx) => {
                            const progress = getStatusProgress(todo.status);
                            const pColor = getPriorityColor(todo.priority);

                            return (
                                <button
                                    key={todo.id}
                                    className="w-full text-left rounded-2xl p-4 transition-all duration-200 animate-fade-in"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        animationDelay: `${idx * 0.04}s`,
                                    }}
                                    onClick={() => { setEditingTodo(todo); setShowForm(true); }}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Priority dot */}
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{
                                                background: `${pColor}20`,
                                                border: `2px solid ${pColor}40`,
                                            }}
                                        >
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: pColor }} />
                                        </div>

                                        {/* Title + progress */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${todo.status === 'completed' ? 'line-through' : ''}`}
                                                style={{ color: todo.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                                {todo.title}
                                            </p>
                                            <div className="mt-2 flex items-center gap-3">
                                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${progress}%`,
                                                            background: `linear-gradient(90deg, var(--accent), ${pColor})`,
                                                            boxShadow: '0 0 8px var(--accent-glow)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Percentage */}
                                        <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                                            {progress}%
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Stats Row ───────────────────────────────────── */}
            <div className="dash-section mt-8 grid grid-cols-3 gap-3">
                {[
                    { label: 'Pending', color: 'var(--warm)' },
                    { label: 'In Progress', color: '#60a5fa' },
                    { label: 'Done', color: '#34d399' },
                ].map(({ label, color }, idx) => (
                    <div
                        key={label}
                        className="glass-card rounded-2xl p-4 flex flex-col items-center gap-1"
                    >
                        <p ref={statCountRefs[idx]} className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                            0
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                {label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

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
