import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FolderOpen, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { Category } from '../types';

const schema = z.object({
    name: z.string().min(1).max(50),
    color: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const PRESET_COLORS = ['#E2FF00', '#FF7F3E', '#60a5fa', '#f472b6', '#34d399', '#a78bfa', '#fb923c'];

export function CategoriesPage() {
    const navigate = useNavigate();
    const { data: categories, isLoading } = useCategories();
    const createCategory = useCreateCategory();
    const deleteCategory = useDeleteCategory();
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { color: PRESET_COLORS[0] },
    });

    const onSubmit = (data: FormData) => {
        createCategory.mutate({ name: data.name, color: selectedColor }, { onSuccess: () => reset() });
    };

    return (
        <div className="px-5 pb-8 max-w-2xl mx-auto lg:max-w-none lg:px-8">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Organize</p>
                <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Categories</h1>
            </div>

            {/* Create form */}
            <div className="card p-5 mb-5 animate-fade-in">
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>New Category</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <input {...register('name')} placeholder="Category name"
                        className={`input-square ${errors.name ? 'input-error' : ''}`} />

                    {/* Color picker */}
                    <div>
                        <label className="label">Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                                <button key={c} type="button"
                                    onClick={() => setSelectedColor(c)}
                                    className="w-8 h-8 rounded-full transition-transform"
                                    style={{
                                        background: c,
                                        transform: selectedColor === c ? 'scale(1.25)' : 'scale(1)',
                                        boxShadow: selectedColor === c ? `0 0 12px ${c}80` : 'none',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={createCategory.isPending}
                        className="btn-accent w-full h-11 text-sm">
                        <Plus size={16} /> Add Category
                    </button>
                </form>
            </div>

            {/* Category list */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
                </div>
            ) : (categories?.length ?? 0) === 0 ? (
                <div className="card p-10 text-center">
                    <FolderOpen size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No categories yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {categories?.map((cat: Category) => (
                        <div key={cat.id}
                            className="card p-4 flex items-center gap-4 animate-fade-in cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => navigate(`/todos?category=${cat.id}`)}
                        >
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                            <div className="flex-1">
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteCategory.mutate(cat.id); }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                                <Trash2 size={13} />
                            </button>
                            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
