import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-5 text-center">
            <p className="text-9xl font-black" style={{ color: 'var(--accent)' }}>404</p>
            <h1 className="mt-2 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Page not found</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                The page you're looking for doesn't exist.
            </p>
            <Link to="/" className="btn-accent mt-6 text-sm">Back to Home</Link>
        </div>
    );
}
