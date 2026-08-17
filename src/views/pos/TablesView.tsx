import { money } from '@/lib/format';
import type { Order, Table } from '@/types';

interface TablesViewProps {
  tables: Table[];
  orders: Order[];
  occupiedTableIds: Set<string>;
  isCajero: boolean;
  onTableSelect: (tableId: string) => void;
  onBarraSelect: () => void;
  onLlevarSelect: () => void;
}

export function TablesView({ tables, orders, occupiedTableIds, isCajero, onTableSelect, onBarraSelect, onLlevarSelect }: TablesViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="font-serif text-xl font-semibold text-stone-800">Seleccionar Mesa</h2>
        <p className="text-sm text-stone-500">{isCajero ? 'Selecciona una mesa para cobrar o agregar ítems' : 'Toca una mesa para ver o crear pedido'}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => {
          const occupied = occupiedTableIds.has(table.id);
          const order = orders.find((o) => o.destination.type === 'mesa' && o.destination.tableId === table.id && !o.paid);
          const isReady = order?.status === 'listo';
          return (
            <button
              key={table.id}
              onClick={() => onTableSelect(table.id)}
              className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                isReady
                  ? 'border-red-400 bg-red-50 hover:border-red-500 animate-pulse'
                  : occupied
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                    : 'border-emerald-300 bg-emerald-50 hover:border-emerald-500'
              }`}
            >
              {isReady && (
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">!</span>
              )}
              <span className="text-3xl">{occupied ? '🍽️' : '✅'}</span>
              <p className="mt-2 font-semibold text-stone-700">{table.name}</p>
              <p className="text-xs text-stone-400">{table.capacity} personas</p>
              {occupied && order && (
                <div className="mt-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${
                    isReady ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                  }`}>
                    {isReady ? '¡Listo para despachar!' : `${order.items.length} ítems · ${money(order.total)}`}
                  </span>
                </div>
              )}
            </button>
          );
        })}
        {(() => {
          const barraOrder = orders.find((o) => o.destination.type === 'barra' && !o.paid);
          const isBarraReady = barraOrder?.status === 'listo';
          return (
            <button
              onClick={onBarraSelect}
              className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                isBarraReady
                  ? 'border-red-400 bg-red-50 hover:border-red-500 animate-pulse'
                  : barraOrder
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                    : 'border-stone-300 bg-white hover:border-stone-500'
              }`}
            >
              {isBarraReady && <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">!</span>}
              <span className="text-3xl">🍺</span>
              <p className="mt-2 font-semibold text-stone-700">Barra</p>
              {barraOrder && (
                <div className="mt-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${isBarraReady ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                    {isBarraReady ? '¡Listo!' : `${barraOrder.ticket} · ${money(barraOrder.total)}`}
                  </span>
                </div>
              )}
            </button>
          );
        })()}
        {(() => {
          const llevarOrder = orders.find((o) => o.destination.type === 'llevar' && !o.paid);
          const isLlevarReady = llevarOrder?.status === 'listo';
          return (
            <button
              onClick={onLlevarSelect}
              className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                isLlevarReady
                  ? 'border-red-400 bg-red-50 hover:border-red-500 animate-pulse'
                  : llevarOrder
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                    : 'border-stone-300 bg-white hover:border-stone-500'
              }`}
            >
              {isLlevarReady && <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">!</span>}
              <span className="text-3xl">📦</span>
              <p className="mt-2 font-semibold text-stone-700">Para Llevar</p>
              {llevarOrder && (
                <div className="mt-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${isLlevarReady ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                    {isLlevarReady ? '¡Listo!' : `${llevarOrder.ticket} · ${money(llevarOrder.total)}`}
                  </span>
                </div>
              )}
            </button>
          );
        })()}
      </div>
    </div>
  );
}
