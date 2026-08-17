import { Edit3, Plus, Trash2 } from 'lucide-react';
import type { CategoryItem, CategoryKey } from '@/types';

interface CategoriesTabProps {
  categories: CategoryItem[];
  setIsCategoryModalOpen: (open: boolean) => void;
  setEditingCategory: (cat: CategoryItem | null) => void;
  handleDeleteCategory: (id: string) => void;
  getCategoryStats: (category: CategoryKey) => { available: number; total: number };
}

export function CategoriesTab({ categories, setIsCategoryModalOpen, setEditingCategory, handleDeleteCategory, getCategoryStats }: CategoriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-800">Categorías</h1>
          <p className="text-sm text-stone-500">Gestionar categorías de productos</p>
        </div>
        <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
          <Plus className="h-4 w-4" /> Nueva Categoría
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const stats = getCategoryStats(cat.key);
          return (
            <div key={cat.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-stone-700">{cat.name}</h3>
                    <p className="text-xs text-stone-400">{stats.total} productos</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingCategory(cat)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
