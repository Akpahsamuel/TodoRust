import api from './api';
import type { CreateTagInput, Tag } from '../types';

export const tagsService = {
    async list(): Promise<Tag[]> {
        const res = await api.get<Tag[]>('/api/tags');
        return res.data;
    },

    async create(data: CreateTagInput): Promise<Tag> {
        const res = await api.post<Tag>('/api/tags', data);
        return res.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/api/tags/${id}`);
    },
};
