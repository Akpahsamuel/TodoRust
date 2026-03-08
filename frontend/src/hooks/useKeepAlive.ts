import { useEffect } from 'react';

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const HEALTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/health`;

export function useKeepAlive() {
    useEffect(() => {
        const ping = () => {
            fetch(HEALTH_URL).catch(() => {});
        };

        ping(); // initial ping
        const id = setInterval(ping, INTERVAL_MS);
        return () => clearInterval(id);
    }, []);
}
