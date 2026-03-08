import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { TodoList } from '../components/todos/TodoList';
import { useCategories } from '../hooks/useCategories';

export function TodosPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const categoryId = searchParams.get('category');
    const { data: categories } = useCategories();
    const activeCat = categoryId ? categories?.find((c) => c.id === categoryId) : null;

    return (
        <div className="px-5 pb-8 max-w-2xl mx-auto lg:max-w-none lg:px-8">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                    {activeCat ? 'Category' : 'My Tasks'}
                </p>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                        {activeCat ? activeCat.name : 'All Tasks'}
                    </h1>
                    {activeCat && (
                        <>
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: activeCat.color }} />
                            <button
                                onClick={() => navigate('/todos')}
                                className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                            >
                                Clear <X size={12} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <TodoList />
        </div>
    );
}
