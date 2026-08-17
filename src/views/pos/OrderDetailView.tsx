import { CheckCircle2, Plus, Wallet } from 'lucide-react';
import { money, destLabel } from '@/lib/format';
import type { Order, Table } from '@/types';
import type { OrderDestination } from '@/types';

interface OrderDetailViewProps {
  activeOrder: Order;
  activeDestination: OrderDestination;
  tables: Table[];
  isCajero: boolean;
  onBack: () => void;
  onAddItems: () => void;
  onTransfer: () => void;
  onPay: (order: Order) => void;
}

export function OrderDetailView({ activeOrder, activeDestination, tables, isCajero, onBack, onAddItems, onTransfer, onPay }: OrderDetailViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-stone-400 hover:text-stone-600">← Volver a mesas</button>
          <h2 className="font-serif text-xl font-semibold text-stone-800">{destLabel(activeDestination, tables)}</h2>
          <p className="text-sm text-stone-500">Pedido {activeOrder.ticket} · {activeOrder.items.length} ítems · {activeOrder.status === 'listo' ? '¡LISTO!' : activeOrder.status}</p>
        </div>
        <div className="flex gap-2">
          {activeDestination.type === 'mesa' && (
            <button onClick={onTransfer} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm">
              ⇄ Cambiar Mesa
            </button>
          )}
          <button onClick={onAddItems} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
            <Plus className="h-4 w-4" /> Agregar ítems
          </button>
          {isCajero && (
            <button onClick={() => onPay(activeOrder)} className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700">
              <Wallet className="h-4 w-4" /> Cobrar {money(activeOrder.total)}
            </button>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <ul className="divide-y divide-stone-100">
          {activeOrder.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-700">{item.name}</span>
                  {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-amber-600">{item.modifiers.join(', ')}</p>
                )}
                {item.extras.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.extras.map((e) => (
                      <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">
                        {e.name} +{money(e.price)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-stone-700">{item.qty}x {money(item.price)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
