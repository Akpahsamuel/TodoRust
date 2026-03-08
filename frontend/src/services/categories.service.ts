import api from './api';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types';

export const categoriesService = {
    async list(): Promise<Category[]> {
        const res = await api.get<Category[]>('/api/categories');
        return res.data;
    },

    async create(data: CreateCategoryInput): Promise<Category> {
        const res = await api.post<Category>('/api/categories', data);
        return res.data;
    },

    async update(id: string, data: UpdateCategoryInput): Promise<Category> {
        const res = await api.put<Category>(`/api/categories/${id}`, data);
        return res.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/categories/${id}`);
    },
};
