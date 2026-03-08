import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useCreateTodo, useUpdateTodo } from '../../hooks/useTodos';
import { useCategories } from '../../hooks/useCategories';
import type { TodoWithTags } from '../../types';
import { todoStatusOptions, todoPriorityOptions } from './constants';
import { DateTimePicker } from './DateTimePicker';

const schema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    due_date: z.string().optional(),
    category_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TodoFormProps {
    todo?: TodoWithTags | null;
    onClose: () => void;
}

export function TodoForm({ todo, onClose }: TodoFormProps) {
    const { data: categories } = useCategories();
    const createTodo = useCreateTodo();
    const updateTodo = useUpdateTodo();

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: todo
            ? {
                title: todo.title,
                description: todo.description ?? '',
                status: todo.status,
                priority: todo.priority,
                due_date: todo.due_date ?? '',
                category_id: todo.category_id ?? '',
            }
            : { status: 'pending', priority: 'medium' },
    });

    const dueDate = watch('due_date');

    const isLoading = createTodo.isPending || updateTodo.isPending;

    const onSubmit = (data: FormData) => {
        const payload = {
            ...data,
            due_date: data.due_date || undefined,
            category_id: data.category_id || undefined,
        };
        if (todo) {
            updateTodo.mutate({ id: todo.id, data: payload }, { onSuccess: onClose });
        } else {
            createTodo.mutate(payload as any, { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pb-[env(safe-area-inset-bottom,20px)]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-md animate-slide-up flex flex-col max-h-[85dvh]"
                style={{ background: 'var(--surface)', borderRadius: '28px', border: '1px solid var(--border)' }}>

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 pt-6 pb-4"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="text-lg font-black">{todo ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24 sm:pb-6 pt-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="label">Task Title</label>
                        <input {...register('title')} placeholder="What needs to be done?"
                            className={`input-square ${errors.title ? 'input-error' : ''}`} />
                        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Notes</label>
                        <textarea {...register('description')} placeholder="Add details..." rows={3}
                            className="input-square resize-none w-full" />
                    </div>

                    {/* Status + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Status</label>
                            <select {...register('status')} className="input-square">
                                {todoStatusOptions.map((o) => (
                                    <option key={o.value} value={o.value} style={{ background: 'var(--surface-2)' }}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Priority</label>
                            <select {...register('priority')} className="input-square">
                                {todoPriorityOptions.map((o) => (
                                    <option key={o.value} value={o.value} style={{ background: 'var(--surface-2)' }}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category */}
                    {categories && categories.length > 0 && (
                        <div>
                            <label className="label">Category</label>
                            <select {...register('category_id')} className="input-square">
                                <option value="" style={{ background: 'var(--surface-2)' }}>No category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id} style={{ background: 'var(--surface-2)' }}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Due Date */}
                    <div>
                        <label className="label">Due Date</label>
                        <DateTimePicker
                            value={dueDate}
                            onChange={(val) => setValue('due_date', val, { shouldValidate: true })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-surface flex-1 h-12">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-accent flex-1 h-12">
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : todo ? 'Save Changes' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
