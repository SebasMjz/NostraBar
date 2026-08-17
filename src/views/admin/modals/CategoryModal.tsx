import { X } from 'lucide-react';
import type { CategoryItem } from '@/types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: CategoryItem | null;
  setEditingCategory: (cat: CategoryItem | null) => void;
  newCatName: string;
  setNewCatName: (name: string) => void;
  newCatEmoji: string;
  setNewCatEmoji: (emoji: string) => void;
  handleCreateCategory: () => void;
  updateCategory: (id: string, data: { name: string; emoji: string }) => void;
}

export function CategoryModal({ isOpen, onClose, editingCategory, setEditingCategory, newCatName, setNewCatName, newCatEmoji, setNewCatEmoji, handleCreateCategory, updateCategory }: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">{editingCategory ? 'Editar' : 'Nueva'} Categoría</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Nombre</label>
            <input value={editingCategory ? editingCategory.name : newCatName} onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCatName(e.target.value)} placeholder="Ej: Postres" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Emoji</label>
            <input value={editingCategory ? editingCategory.emoji : newCatEmoji} onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, emoji: e.target.value }) : setNewCatEmoji(e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
        </div>
        <button
          onClick={() => {
            if (editingCategory) {
              updateCategory(editingCategory.id, { name: editingCategory.name, emoji: editingCategory.emoji });
              setEditingCategory(null);
            } else {
              handleCreateCategory();
            }
            onClose();
          }}
          disabled={editingCategory ? false : !newCatName.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40"
        >
          {editingCategory ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </div>
  );
}
