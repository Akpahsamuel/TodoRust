import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { BottomNav } from './BottomNav';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
    LayoutDashboard,
    CheckSquare,
    FolderOpen,
    Tag,
    LogOut,
    Zap,
} from 'lucide-react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: CheckSquare, label: 'My Tasks', to: '/todos' },
    { icon: FolderOpen, label: 'Categories', to: '/categories' },
    { icon: Tag, label: 'Tags', to: '/tags' },
];

export function Layout() {
    const { user, logout } = useAuthStore();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    useWebSocket();

    return (
        <div className="flex min-h-dvh">
            {/* Sidebar — desktop only */}
            <aside className="sidebar hidden lg:flex flex-col min-h-dvh sticky top-0">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'var(--accent)' }}>
                        <Zap size={18} color="#000" fill="#000" />
                    </div>
                    <span className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>TodoFlow</span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {sidebarItems.map(({ icon: Icon, label, to }) => {
                        const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                        return (
                            <Link key={to} to={to} className={`sidebar-link ${active ? 'active' : ''}`}>
                                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--surface-2)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{ background: 'var(--accent)', color: '#000' }}>
                            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                {user?.name ?? user?.email}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </div>
                        <button onClick={logout} className="btn-ghost p-2 rounded-xl" title="Logout">
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 pb-20 lg:pb-0 overflow-x-hidden">
                {/* Mobile top bar */}
                <header className="flex items-center justify-between px-5 pt-12 pb-4 lg:hidden">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'var(--accent)' }}>
                            <Zap size={15} color="#000" fill="#000" />
                        </div>
                        <span className="text-base font-black">TodoFlow</span>
                    </div>
                    <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-transform active:scale-95"
                        style={{ background: 'var(--accent)', color: '#000' }}>
                        {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </button>
                </header>

                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            <div className="lg:hidden">
                <BottomNav />
            </div>
        </div>
    );
}
