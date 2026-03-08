import type { WsEvent } from '../types';
import { useAuthStore } from '../store/auth.store';

type WsListener = (event: WsEvent) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private listeners: WsListener[] = [];
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private baseUrl: string;
    private retryCount = 0;
    private maxRetries = 5;

    constructor() {
        this.baseUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8080') + '/ws';
    }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        const token = useAuthStore.getState().accessToken;
        if (!token) {
            // Not authenticated — don't attempt WS connection
            return;
        }

        const url = `${this.baseUrl}?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('[WS] Connected');
            this.retryCount = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };

        this.ws.onmessage = (ev) => {
            try {
                const event = JSON.parse(ev.data) as WsEvent;
                this.listeners.forEach((l) => l(event));
            } catch (e) {
                console.warn('[WS] Failed to parse message', e);
            }
        };

        this.ws.onclose = () => {
            if (this.retryCount >= this.maxRetries) {
                console.log('[WS] Max retries reached. Stopping reconnect.');
                return;
            }
            const delay = Math.min(3000 * Math.pow(2, this.retryCount), 30000);
            this.retryCount++;
            console.log(`[WS] Disconnected. Reconnecting in ${delay / 1000}s...`);
            this.reconnectTimer = setTimeout(() => this.connect(), delay);
        };

        this.ws.onerror = () => {
            this.ws?.close();
        };
    }

    disconnect() {
        this.retryCount = this.maxRetries; // prevent reconnect
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.ws?.close();
        this.ws = null;
        this.retryCount = 0;
    }

    subscribe(listener: WsListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
}

export const wsService = new WebSocketService();
