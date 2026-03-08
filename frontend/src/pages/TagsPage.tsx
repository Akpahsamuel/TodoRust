import { useState } from 'react';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tagsService } from '../services/tags.service';

export function TagsPage() {
    const [name, setName] = useState('');
    const qc = useQueryClient();

    const { data: tags, isLoading } = useQuery({
        queryKey: ['tags'],
        queryFn: tagsService.list,
    });

    const createTag = useMutation({
        mutationFn: tagsService.create,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); setName(''); toast.success('Tag created!'); },
        onError: () => toast.error('Failed to create tag'),
    });

    const deleteTag = useMutation({
        mutationFn: tagsService.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); toast.success('Tag deleted'); },
        onError: () => toast.error('Failed to delete tag'),
    });

    return (
        <div className="px-5 pb-8 max-w-2xl mx-auto lg:max-w-none lg:px-8">
            <div className="mb-6 animate-fade-in">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Organize</p>
                <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Tags</h1>
            </div>

            {/* Create tag */}
            <div className="card p-5 mb-5 animate-fade-in">
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>New Tag</h2>
                <div className="flex gap-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name"
                        className="input-square flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && name.trim() && createTag.mutate({ name: name.trim() })} />
                    <button onClick={() => name.trim() && createTag.mutate({ name: name.trim() })}
                        disabled={!name.trim() || createTag.isPending}
                        className="btn-accent px-4 h-11 flex-shrink-0">
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Tags list */}
            {isLoading ? (
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-9 w-20 rounded-full" />)}
                </div>
            ) : (tags?.length ?? 0) === 0 ? (
                <div className="card p-10 text-center">
                    <TagIcon size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No tags yet</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {tags?.map((tag) => (
                        <div key={tag.id}
                            className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-full animate-fade-in"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tag.name}</span>
                            <button onClick={() => deleteTag.mutate(tag.id)}
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                                <Trash2 size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
