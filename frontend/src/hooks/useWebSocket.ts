import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsService } from '../services/ws.service';
import { useAuthStore } from '../store/auth.store';
import { TODO_KEYS } from './useTodos';

export function useWebSocket() {
    const qc = useQueryClient();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        wsService.connect();

        const unsub = wsService.subscribe((_event) => {
            // Invalidate todo queries when any todo event comes in
            qc.invalidateQueries({ queryKey: TODO_KEYS.all });
        });

        return () => {
            unsub();
            // Don't disconnect on component unmount; let the service manage the singleton
        };
    }, [isAuthenticated, qc]);
}
