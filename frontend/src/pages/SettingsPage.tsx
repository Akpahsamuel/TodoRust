import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import { LogOut, Bell, Shield, Moon, Sun } from 'lucide-react';

export function SettingsPage() {
    const { user, logout } = useAuthStore();
    const { isDark, toggleTheme } = useThemeStore();

    return (
        <div className="min-h-screen px-6 py-8 pb-32 max-w-2xl mx-auto animate-fade-in">
            <header className="mb-10">
                <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
                <p className="text-[var(--text-secondary)] font-medium">Manage your account and app preferences</p>
            </header>

            {/* Profile Section */}
            <section className="mb-10">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4">Profile</h2>
                <div className="card p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl"
                        style={{ background: 'var(--accent)', color: '#000' }}>
                        {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{user?.name ?? 'User'}</h3>
                        <p className="text-[var(--text-secondary)]">{user?.email}</p>
                    </div>
                    <button onClick={logout} className="btn-surface px-4 py-2 text-sm flex items-center gap-2">
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </section>

            {/* General Settings */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mt-8 mb-4">General</h2>

                <div className="card-hover p-5 flex items-center justify-between" onClick={toggleTheme}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--surface-2)] rounded-xl">
                            {isDark ? <Moon size={20} className="text-[var(--accent)]" /> : <Sun size={20} className="text-[var(--accent)]" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{isDark ? 'Dark Theme' : 'Light Theme'}</h4>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">Tap to switch to {isDark ? 'light' : 'dark'} mode</p>
                        </div>
                    </div>
                    {/* Toggle Switch */}
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-black rounded-full shadow-sm transition-transform ${isDark ? 'right-1 translate-x-0' : 'left-1 translate-x-0 bg-white'}`} />
                    </div>
                </div>

                <div className="card-hover p-5 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--surface-2)] rounded-xl">
                            <Bell size={20} className="text-[var(--text-muted)]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Notifications</h4>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">Coming soon in Phase 3</p>
                        </div>
                    </div>
                </div>

                <div className="card-hover p-5 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--surface-2)] rounded-xl">
                            <Shield size={20} className="text-[var(--text-muted)]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Privacy & Security</h4>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">Manage password and sessions</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
