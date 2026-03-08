import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FolderOpen, Settings, Plus } from 'lucide-react';
import { TodoForm } from '../todos/TodoForm';

const leftItems = [
    { icon: LayoutDashboard, label: 'Home', to: '/' },
    { icon: CheckSquare, label: 'Tasks', to: '/todos' },
];

const rightItems = [
    { icon: FolderOpen, label: 'Lists', to: '/categories' },
    { icon: Settings, label: 'Setting', to: '/settings' },
];

export function BottomNav() {
    const { pathname } = useLocation();
    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <nav
                className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-6"
                style={{
                    height: 88,
                    paddingBottom: 16,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)',
                    zIndex: 50,
                }}
            >
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-full"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Left items */}
                    {leftItems.map(({ icon: Icon, to }) => {
                        const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                className="flex items-center justify-center rounded-full transition-all duration-200"
                                style={{
                                    width: 48,
                                    height: 48,
                                    background: active ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                                    color: active ? '#000' : 'rgba(255,255,255,0.4)',
                                }}
                            >
                                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            </Link>
                        );
                    })}

                    {/* Centre FAB */}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center rounded-full transition-transform active:scale-90"
                        style={{
                            width: 52,
                            height: 52,
                            background: 'var(--accent)',
                            boxShadow: '0 4px 24px var(--accent-glow)',
                        }}
                    >
                        <Plus size={24} color="#000" strokeWidth={2.5} />
                    </button>

                    {/* Right items */}
                    {rightItems.map(({ icon: Icon, to }) => {
                        const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                className="flex items-center justify-center rounded-full transition-all duration-200"
                                style={{
                                    width: 48,
                                    height: 48,
                                    background: active ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                                    color: active ? '#000' : 'rgba(255,255,255,0.4)',
                                }}
                            >
                                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {showForm && (
                <TodoForm todo={null} onClose={() => setShowForm(false)} />
            )}
        </>
    );
}
