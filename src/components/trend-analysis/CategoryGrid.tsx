import CategoryCard from './CategoryCard';

const CATEGORIES = [
    { id: 'frontend', name: 'Frontend', color: '#1C89AD' },
    { id: 'backend', name: 'Backend', color: '#1A5D3B' },
    { id: 'ai-data', name: 'AI & Data', color: '#5D2E7A' },
    { id: 'devops', name: 'DevOps', color: '#9A6B2D' },
    { id: 'embedding', name: 'Embedding', color: '#8B2E3A' },
    { id: 'game', name: 'Game', color: '#6A7A2E' },
    { id: 'security', name: 'Security', color: '#3A4A5A' },
    ];

    export default function CategoryGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 place-items-center">
        {CATEGORIES.map((category) => (
            <CategoryCard 
            key={category.id} 
            name={category.name} 
            color={category.color} 
            id={category.id}
            />
        ))}
        </div>
    );
}