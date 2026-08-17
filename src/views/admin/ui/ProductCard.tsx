import { Edit3, Trash2 } from 'lucide-react';
import { money } from '@/lib/format';
import type { Product } from '@/types';

export function ProductCard({ product, onToggle, onEdit, onDelete }: { product: Product; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${product.available ? 'border-stone-200 hover:border-amber-400' : 'border-stone-200 bg-stone-50 opacity-75'}`}>
      <div className="mb-3 flex items-start justify-between">
        <h3 className="flex-1 font-semibold text-stone-700">{product.name}</h3>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${product.available ? 'bg-emerald-500' : 'bg-stone-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${product.available ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {product.variants && product.variants.length > 0 ? (
        <div className="mb-3 space-y-1">
          {product.variants.map((v, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-stone-500">{v.name}</span>
              <span className="font-semibold text-stone-700">{money(v.price)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-lg font-bold text-stone-800">{money(product.price)}</p>
      )}
      {product.modifiers && product.modifiers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {product.modifiers.slice(0, 3).map((mod, i) => (
            <span key={i} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">{mod}</span>
          ))}
          {product.modifiers.length > 3 && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">+{product.modifiers.length - 3}</span>}
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200">
          <Edit3 className="h-3 w-3" /> Editar
        </button>
        <button onClick={onDelete} className="flex items-center justify-center rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
