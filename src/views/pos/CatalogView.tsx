import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { money, destLabel, categoryLabels, posCategories } from '@/lib/format';
import type { CategoryKey, Order, Product, Table, Transaction } from '@/types';
import type { OrderDestination } from '@/types';
import { emojiFor } from './utils';

interface CatalogViewProps {
  showTables: boolean;
  isCajero: boolean;
  activeDestination: OrderDestination;
  activeOrder: Order | null;
  tables: Table[];
  products: Product[];
  transactions: Transaction[];
  activeCashRegister: any;
  onClose: () => void;
  onSetDestination: (dest: OrderDestination) => void;
  onProductClick: (p: Product) => void;
  onSetPayModal: (show: boolean, order?: Order) => void;
  onSetIsCashOpenModal: (show: boolean) => void;
  onSetIsCashCloseModal: (show: boolean) => void;
  onSetCountedCashInput: (val: number) => void;
}

export function CatalogView({
  showTables,
  isCajero,
  activeDestination,
  activeOrder,
  tables,
  products,
  transactions,
  activeCashRegister,
  onClose,
  onSetDestination,
  onProductClick,
  onSetPayModal,
  onSetIsCashOpenModal,
  onSetIsCashCloseModal,
  onSetCountedCashInput,
}: CatalogViewProps) {
  const [cat, setCat] = useState<CategoryKey>('espresso');
  const [query, setQuery] = useState('');

  const catalog = useMemo(() => {
    const list = products.filter((p) => p.category === cat && p.price > 0);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, cat, query]);

  return (
    <>
      <div className="border-b border-stone-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showTables && (
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            )}
            <div>
              <p className="text-sm font-semibold text-stone-700">
                {showTables ? destLabel(activeDestination, tables) : 'Punto de Venta'}
              </p>
              {activeOrder && <p className="text-xs text-amber-600">Pedido activo: {activeOrder.ticket}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCashRegister ? (
              <button
                onClick={() => {
                  const cashSales = transactions.filter((t) => t.method === 'efectivo').reduce((s, t) => s + t.total, 0);
                  onSetCountedCashInput((activeCashRegister.initial_amount || 0) + cashSales);
                  onSetIsCashCloseModal(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Caja Abierta · Cuadre
              </button>
            ) : (
              <button
                onClick={() => onSetIsCashOpenModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
              >
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Caja Cerrada · Abrir
              </button>
            )}
            {isCajero && activeOrder && (
              <button onClick={() => onSetPayModal(true, activeOrder)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
                Cobrar {money(activeOrder.total)}
              </button>
            )}
          </div>
        </div>
      </div>

      {isCajero && !showTables && (
        <div className="border-b border-stone-200 bg-white px-4 py-2">
          <div className="flex flex-wrap gap-1.5">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => onSetDestination({ type: 'mesa', tableId: table.id })}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeDestination.type === 'mesa' && activeDestination.tableId === table.id
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {table.name}
              </button>
            ))}
            <button onClick={() => onSetDestination({ type: 'barra' })} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${activeDestination.type === 'barra' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              Barra
            </button>
            <button onClick={() => onSetDestination({ type: 'llevar' })} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${activeDestination.type === 'llevar' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              Para Llevar
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-stone-200 bg-white px-4 py-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto..." className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-700 outline-none focus:border-stone-400 focus:bg-white" />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2.5">
        {posCategories.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${cat === c ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {categoryLabels[c]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {catalog.map((p) => {
            const extras = products.filter((ep) => ep.category === 'extras' && ep.available && p.availableExtras?.includes(ep.id));
            return (
              <button key={p.id} onClick={() => onProductClick(p)} disabled={!p.available} className={`group relative flex flex-col rounded-xl border p-3 text-left transition-all ${p.available ? 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-md' : 'border-stone-200 bg-stone-100 opacity-60'}`}>
                <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-stone-100">
                  <span className="text-2xl">{emojiFor(p)}</span>
                </div>
                <p className="text-sm font-semibold leading-tight text-stone-700">{p.name}</p>
                <span className="mt-1 text-sm font-bold text-amber-700">{money(p.price)}</span>
                {extras.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {extras.slice(0, 3).map((e) => (
                      <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">
                        {e.name} {money(e.price)}
                      </span>
                    ))}
                    {extras.length > 3 && <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-500">+{extras.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {catalog.length === 0 && <p className="py-10 text-center text-sm text-stone-400">No se encontraron productos.</p>}
      </div>
    </>
  );
}
