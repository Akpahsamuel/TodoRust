import api from './api';
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types';

export const authService = {
    async register(data: RegisterInput): Promise<AuthResponse> {
        const res = await api.post<AuthResponse>('/api/auth/register', data);
        return res.data;
    },

    async login(data: LoginInput): Promise<AuthResponse> {
        const res = await api.post<AuthResponse>('/api/auth/login', data);
        return res.data;
    },

    async logout(): Promise<void> {
        await api.post('/api/auth/logout');
    },

    async me(): Promise<User> {
        const res = await api.get<User>('/api/auth/me');
        return res.data;
    },
};
