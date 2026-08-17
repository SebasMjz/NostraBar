import { Edit3, Plus, Table2, Trash2 } from 'lucide-react';
import type { Order, Table } from '@/types';

interface TablesTabProps {
  tables: Table[];
  orders: Order[];
  setIsTableModalOpen: (open: boolean) => void;
  setEditingTable: (table: Table | null) => void;
  setNewTableName: (name: string) => void;
  setNewTableNumber: (num: number) => void;
  setNewTableCapacity: (cap: number) => void;
  handleDeleteTable: (id: string) => void;
}

export function TablesTab({ tables, orders, setIsTableModalOpen, setEditingTable, setNewTableName, setNewTableNumber, setNewTableCapacity, handleDeleteTable }: TablesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-800">Mesas</h1>
          <p className="text-sm text-stone-500">Gestionar mesas del restaurante</p>
        </div>
        <button onClick={() => setIsTableModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
          <Plus className="h-4 w-4" /> Nueva Mesa
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          const isActive = orders.some((o) => o.destination.type === 'mesa' && o.destination.tableId === table.id && o.status !== 'despachado');
          return (
            <div key={table.id} className={`rounded-xl border bg-white p-5 shadow-sm ${isActive ? 'border-amber-400' : 'border-stone-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Table2 className={`h-5 w-5 ${isActive ? 'text-amber-500' : 'text-stone-400'}`} />
                    <h3 className="font-semibold text-stone-700">{table.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">Capacidad: {table.capacity} personas</p>
                  {isActive && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Ocupada</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingTable(table); setNewTableName(table.name); setNewTableNumber(table.number); setNewTableCapacity(table.capacity); setIsTableModalOpen(true); }} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteTable(table.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
        {tables.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm text-stone-400">No hay mesas creadas</p>
            <button onClick={() => setIsTableModalOpen(true)} className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700">+ Crear primera mesa</button>
          </div>
        )}
      </div>
    </div>
  );
}
