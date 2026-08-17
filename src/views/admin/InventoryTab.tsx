import { ChevronRight, Plus, X } from 'lucide-react';
import { categoryLabels, categoryEmojis } from '@/lib/format';
import type { CategoryKey, CategoryItem, Product } from '@/types';
import { ProductCard } from './ui/ProductCard';

interface InventoryTabProps {
  selectedCategory: CategoryKey | null;
  setSelectedCategory: (cat: CategoryKey | null) => void;
  categories: CategoryItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleCreateProduct: (category?: CategoryKey) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (productId: string) => void;
  toggleAvailable: (id: string) => void;
  getCategoryStats: (category: CategoryKey) => { available: number; total: number };
  getProductsByCategory: (category: CategoryKey) => Product[];
}

export function InventoryTab({ selectedCategory, setSelectedCategory, categories, searchQuery, setSearchQuery, handleCreateProduct, handleEditProduct, handleDeleteProduct, toggleAvailable, getCategoryStats, getProductsByCategory }: InventoryTabProps) {
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-800">Inventario</h1>
          <p className="text-sm text-stone-500">Selecciona una categoría</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const stats = getCategoryStats(cat.key);
            return (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.key)} className="group flex flex-col items-center rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all hover:border-amber-400 hover:shadow-md">
                <span className="mb-3 text-4xl">{cat.emoji}</span>
                <h3 className="mb-1 text-sm font-semibold text-stone-700">{cat.name}</h3>
                <p className="text-xs text-stone-400">{stats.available}/{stats.total} disponibles</p>
                <ChevronRight className="mt-3 h-4 w-4 text-stone-300 transition-colors group-hover:text-amber-500" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedCategory(null)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200">
          <X className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryEmojis[selectedCategory]}</span>
            <h1 className="font-serif text-2xl font-semibold text-stone-800">{categoryLabels[selectedCategory]}</h1>
          </div>
        </div>
        <button onClick={() => handleCreateProduct(selectedCategory)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
          <Plus className="h-4 w-4" /> Nuevo Producto
        </button>
      </div>
      <div className="relative">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {getProductsByCategory(selectedCategory).map((product) => (
          <ProductCard key={product.id} product={product} onToggle={() => toggleAvailable(product.id)} onEdit={() => handleEditProduct(product)} onDelete={() => handleDeleteProduct(product.id)} />
        ))}
        {getProductsByCategory(selectedCategory).length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-stone-400">No hay productos</p>
            <button onClick={() => handleCreateProduct(selectedCategory)} className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700">+ Agregar producto</button>
          </div>
        )}
      </div>
    </div>
  );
}
