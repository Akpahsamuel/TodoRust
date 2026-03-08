import { TodoList } from '../components/todos/TodoList';

export function TodosPage() {
    return (
        <div className="px-5 pb-8 max-w-2xl mx-auto lg:max-w-none lg:px-8">
            {/* Header */}
            <div className="mb-6 animate-fade-in">
                <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                    My Tasks
                </p>
                <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>All Tasks</h1>
            </div>

            <TodoList />
        </div>
    );
}
