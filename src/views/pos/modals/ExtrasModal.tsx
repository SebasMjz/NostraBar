import { Plus, X } from 'lucide-react';
import { money } from '@/lib/format';
import type { OrderItemExtra, Product } from '@/types';

interface ExtraToggleItem {
  id: string;
  name: string;
  price: number;
}

interface ExtrasModalProps {
  product: Product;
  products: Product[];
  selectedExtras: OrderItemExtra[];
  onToggleExtra: (extra: ExtraToggleItem) => void;
  onClose: () => void;
  onConfirm: (extras: OrderItemExtra[]) => void;
}

export function ExtrasModal({ product, products, selectedExtras, onToggleExtra, onClose, onConfirm }: ExtrasModalProps) {
  const availableExtras = products.filter((p) => p.category === 'extras' && p.available && product.availableExtras?.includes(p.id));
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price * e.qty, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">{product.name}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">Extras</p>
        <div className="space-y-2">
          {availableExtras.map((extra) => {
            const isSelected = selectedExtras.some((e) => e.id === extra.id);
            return (
              <button key={extra.id} onClick={() => onToggleExtra({ id: extra.id, name: extra.name, price: extra.price })} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${isSelected ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                <span>{extra.name}</span>
                <span className="text-xs text-stone-400">+{money(extra.price)}</span>
              </button>
            );
          })}
        </div>
        {extrasTotal > 0 && <p className="mt-3 text-right text-sm font-semibold text-stone-700">Total: {money(extrasTotal)}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={() => onConfirm([])} className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Sin extra
          </button>
          <button onClick={() => onConfirm(selectedExtras)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
