import { X } from 'lucide-react';
import type { Table } from '@/types';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTable: Table | null;
  setEditingTable: (table: Table | null) => void;
  newTableName: string;
  setNewTableName: (name: string) => void;
  newTableNumber: number;
  setNewTableNumber: (num: number) => void;
  newTableCapacity: number;
  setNewTableCapacity: (cap: number) => void;
  handleCreateTable: () => void;
  updateTable: (id: string, data: { name: string; number: number; capacity: number }) => void;
}

export function TableModal({ isOpen, onClose, editingTable, setEditingTable, newTableName, setNewTableName, newTableNumber, setNewTableNumber, newTableCapacity, setNewTableCapacity, handleCreateTable, updateTable }: TableModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">{editingTable ? 'Editar' : 'Nueva'} Mesa</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Nombre</label>
            <input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="Ej: Mesa Terraza" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Número</label>
              <input type="number" value={newTableNumber} onChange={(e) => setNewTableNumber(parseInt(e.target.value) || 1)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" min="1" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Capacidad</label>
              <input type="number" value={newTableCapacity} onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 2)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" min="1" />
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (editingTable) {
              updateTable(editingTable.id, { name: newTableName, number: newTableNumber, capacity: newTableCapacity });
            } else {
              handleCreateTable();
            }
            onClose();
            setEditingTable(null);
          }}
          disabled={!newTableName.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40"
        >
          {editingTable ? 'Guardar' : 'Crear Mesa'}
        </button>
      </div>
    </div>
  );
}
