import type { WsEvent } from '../types';

type WsListener = (event: WsEvent) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private listeners: WsListener[] = [];
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private url: string;

    constructor() {
        this.url = (import.meta.env.VITE_WS_URL || 'ws://localhost:8080') + '/ws';
    }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('[WS] Connected');
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
            console.log('[WS] Disconnected. Reconnecting in 3s...');
            this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        };

        this.ws.onerror = (e) => {
            console.error('[WS] Error', e);
            this.ws?.close();
        };
    }

    disconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.ws?.close();
        this.ws = null;
    }

    subscribe(listener: WsListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
}

export const wsService = new WebSocketService();
