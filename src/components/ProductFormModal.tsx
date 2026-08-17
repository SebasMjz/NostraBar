import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { CategoryKey } from '@/types';
import { categoryLabels, useStore } from '@/store';

export interface ProductFormData {
  name: string;
  category: CategoryKey;
  available: boolean;
  modifiers: string[];
  availableExtras: string[];
  useVariants: boolean;
  basePrice: number;
  variants: VariantFormData[];
}

export interface VariantFormData {
  name: string;
  price: number;
  available: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  initialData?: { id: string; name: string; category: CategoryKey; available: boolean; modifiers?: string[]; availableExtras?: string[]; variants?: VariantFormData[]; price?: number };
  defaultCategory?: CategoryKey;
  title?: string;
}

export function ProductFormModal({ isOpen, onClose, onSave, initialData, defaultCategory, title }: ProductFormModalProps) {
  const { products } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryKey>('espresso');
  const [available, setAvailable] = useState(true);
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [availableExtras, setAvailableExtras] = useState<string[]>([]);
  const [useVariants, setUseVariants] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [modifierInput, setModifierInput] = useState('');

  const extras = products.filter((p) => p.category === 'extras' && p.available);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setAvailable(initialData.available);
      setModifiers(initialData.modifiers || []);
      setAvailableExtras(initialData.availableExtras || []);
      const hasVariants = initialData.variants && initialData.variants.length > 0;
      setUseVariants(!!hasVariants);
      setVariants(hasVariants ? initialData.variants! : []);
      setBasePrice(initialData.price || 0);
    } else {
      setName('');
      setCategory(defaultCategory || 'espresso');
      setAvailable(true);
      setModifiers([]);
      setAvailableExtras([]);
      setUseVariants(false);
      setVariants([]);
      setBasePrice(0);
    }
  }, [initialData, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleAddModifier = () => {
    if (modifierInput.trim() && !modifiers.includes(modifierInput.trim())) {
      setModifiers([...modifiers, modifierInput.trim()]);
      setModifierInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      available,
      modifiers,
      availableExtras,
      useVariants,
      basePrice,
      variants: useVariants ? variants.filter((v) => v.name.trim()) : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-stone-800">{title || 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Información del Producto</h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Capuchino, Latte..." className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as CategoryKey)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-amber-400">
                {(Object.keys(categoryLabels) as CategoryKey[]).map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-stone-700">Disponible</label>
              <button type="button" onClick={() => setAvailable(!available)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${available ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${available ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Precio o Variantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Presentaciones / Tamaños</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-stone-500">Usar variantes</span>
                <button type="button" onClick={() => setUseVariants(!useVariants)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useVariants ? 'bg-amber-500' : 'bg-stone-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useVariants ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>

            {!useVariants ? (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Precio Base (Bs.)</label>
                <input type="number" value={basePrice || ''} onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)} placeholder="0" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 outline-none focus:border-amber-400" min="0" />
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                    <input type="text" value={variant.name} onChange={(e) => setVariants(variants.map((v, i) => i === index ? { ...v, name: e.target.value } : v))} placeholder="Nombre (ej: Pequeño)" className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">Bs.</span>
                      <input type="number" value={variant.price || ''} onChange={(e) => setVariants(variants.map((v, i) => i === index ? { ...v, price: parseInt(e.target.value) || 0 } : v))} placeholder="Precio" className="w-28 rounded-lg border border-stone-200 pl-10 pr-3 py-2 text-sm outline-none focus:border-amber-400" min="0" />
                    </div>
                    <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== index))} disabled={variants.length <= 1} className="text-stone-400 hover:text-red-500 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setVariants([...variants, { name: '', price: 0, available: true }])} className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
                  <Plus className="h-3.5 w-3.5" /> Agregar variante
                </button>
              </div>
            )}
          </div>

          {/* Personalizaciones */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Personalizaciones</h3>
            <div className="flex gap-2">
              <input type="text" value={modifierInput} onChange={(e) => setModifierInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModifier())} placeholder="Ej: Sin Azúcar..." className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              <button type="button" onClick={handleAddModifier} className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200">Agregar</button>
            </div>
            {modifiers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {modifiers.map((mod) => (
                  <span key={mod} className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {mod}
                    <button type="button" onClick={() => setModifiers(modifiers.filter((m) => m !== mod))} className="text-amber-500 hover:text-amber-700"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Extras */}
          {extras.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Extras Disponibles</h3>
              <p className="text-xs text-stone-400">Extras que se pueden agregar a este producto en el POS</p>
              <div className="flex flex-wrap gap-2">
                {extras.map((extra) => {
                  const isSelected = availableExtras.includes(extra.id);
                  return (
                    <button key={extra.id} type="button" onClick={() => setAvailableExtras((prev) => isSelected ? prev.filter((id) => id !== extra.id) : [...prev, extra.id])} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${isSelected ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                      {extra.name} · Bs. {extra.price.toLocaleString('es-CO')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 border-t border-stone-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50">Cancelar</button>
            <button type="submit" className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-900">{initialData ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
