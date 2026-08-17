import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Product } from '@/types';

interface ModifierModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (mods: string[]) => void;
}

export function ModifierModal({ product, onClose, onConfirm }: ModifierModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (m: string) => setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">{product.name}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">Personalizaciones</p>
        <div className="flex flex-wrap gap-2">
          {product.modifiers?.map((m) => (
            <button key={m} onClick={() => toggle(m)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${selected.includes(m) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={() => onConfirm([])} className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Sin personalización
          </button>
          <button onClick={() => onConfirm(selected)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
