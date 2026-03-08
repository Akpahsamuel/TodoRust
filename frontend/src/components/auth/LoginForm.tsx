import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: authService.login,
        onSuccess: (data) => {
            setAuth(data.user, data.access_token, data.refresh_token);
            toast.success('Welcome back! 👋');
            navigate('/');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error ?? 'Invalid credentials');
        },
    });

    return (
        <div className="min-h-dvh flex items-center justify-center px-5 py-12" style={{ background: 'var(--bg)' }}>
            <div className="w-full max-w-sm animate-slide-up">

                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(226,255,0,0.3)' }}>
                        <Zap size={28} color="#000" fill="#000" />
                    </div>
                    <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                    <div>
                        <label className="label">Email</label>
                        <div className="relative">
                            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input {...register('email')} type="email" placeholder="you@example.com"
                                className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="label">Password</label>
                        <div className="relative">
                            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={mutation.isPending}
                        className="btn-accent w-full mt-2 h-12 text-sm font-bold">
                        {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
