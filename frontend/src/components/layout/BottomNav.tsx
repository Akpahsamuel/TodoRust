import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Tag, FolderOpen, Settings } from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Home', to: '/' },
    { icon: CheckSquare, label: 'Tasks', to: '/todos' },
    { icon: FolderOpen, label: 'Lists', to: '/categories' },
    { icon: Tag, label: 'Tags', to: '/tags' },
    { icon: Settings, label: 'Settings', to: '/settings' },
];

export function BottomNav() {
    const { pathname } = useLocation();

    return (
        <nav className="bottom-nav">
            {navItems.map(({ icon: Icon, label, to }) => {
                const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                return (
                    <Link key={to} to={to} className={`nav-item ${active ? 'active' : ''}`}>
                        <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
