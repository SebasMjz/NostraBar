import { useState } from 'react';
import { X } from 'lucide-react';
import type { Table } from '@/types';

interface TransferTableModalProps {
  currentTableId: string;
  tables: Table[];
  onClose: () => void;
  onConfirm: (toTableId: string) => void;
}

export function TransferTableModal({ currentTableId, tables, onClose, onConfirm }: TransferTableModalProps) {
  const currentTable = tables.find((t) => t.id === currentTableId);
  const availableTables = tables.filter((t) => t.id !== currentTableId && t.available);
  const [selectedToId, setSelectedToId] = useState<string>(availableTables[0]?.id || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800">Transferir Comanda de Mesa</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-xs text-stone-500">
          Transfiere la comanda activa de <strong className="text-stone-800">{currentTable?.name || 'esta mesa'}</strong> a otra mesa libre.
        </p>

        {availableTables.length === 0 ? (
          <p className="py-4 text-center text-xs text-red-600 font-semibold">No hay otras mesas libres disponibles para transferir.</p>
        ) : (
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-stone-600">Seleccionar Mesa Destino:</label>
            <select
              value={selectedToId}
              onChange={(e) => setSelectedToId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-800 outline-none focus:border-amber-400 focus:bg-white"
            >
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Capacidad: {t.capacity} personas)
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => onConfirm(selectedToId)}
          disabled={!selectedToId || availableTables.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-bold text-white shadow-md hover:bg-stone-900 disabled:opacity-40"
        >
          Confirmar Transferencia
        </button>
      </div>
    </div>
  );
}
