import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesService } from '../services/categories.service';
import type { CreateCategoryInput } from '../types';

export const CATEGORY_KEYS = {
    all: ['categories'] as const,
};

export function useCategories() {
    return useQuery({
        queryKey: CATEGORY_KEYS.all,
        queryFn: categoriesService.list,
    });
}

export function useCreateCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCategoryInput) => categoriesService.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
            toast.success('Category created!');
        },
        onError: () => toast.error('Failed to create category'),
    });
}

export function useDeleteCategory() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => categoriesService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
            toast.success('Category deleted');
        },
        onError: () => toast.error('Failed to delete category'),
    });
}
