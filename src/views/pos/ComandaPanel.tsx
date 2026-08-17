import { Eye, Minus, Plus, Send, ShoppingCart, Trash2, Wallet } from 'lucide-react';
import { money, destLabel } from '@/lib/format';
import type { Order, OrderItem, OrderDestination, Table } from '@/types';

interface ComandaPanelProps {
  activeItems: OrderItem[];
  activeDestination: OrderDestination;
  activeOrder: Order | null;
  tables: Table[];
  subtotal: number;
  total: number;
  discount: number;
  isCajero: boolean;
  onSetDiscount: (val: number) => void;
  onChangeQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSetItemNote: (itemId: string, note: string) => void;
  onSetViewMode: (mode: 'orderDetail' | 'preview') => void;
  onSendToKitchen: () => void;
  onSetPayModal: (show: boolean) => void;
}

export function ComandaPanel({
  activeItems,
  activeDestination,
  activeOrder,
  tables,
  subtotal,
  total,
  discount,
  isCajero,
  onSetDiscount,
  onChangeQty,
  onRemoveItem,
  onSetItemNote,
  onSetViewMode,
  onSendToKitchen,
  onSetPayModal,
}: ComandaPanelProps) {
  return (
    <aside className="flex w-full flex-col border-t border-stone-200 bg-white lg:w-96 lg:border-l lg:border-t-0">
      <div className="border-b border-stone-200 bg-stone-800 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold">Comanda</h2>
          </div>
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">{destLabel(activeDestination, tables)}</span>
        </div>
      </div>

      {activeOrder && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold">Agregando a pedido {activeOrder.ticket}</p>
            <p className="text-[10px] text-amber-700">Estado en cocina: <span className="font-semibold capitalize">{activeOrder.status}</span></p>
          </div>
          <button onClick={() => onSetViewMode('orderDetail')} className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950">
            Ver pedido
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {activeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-stone-300">
            <ShoppingCart className="mb-3 h-12 w-12" />
            <p className="text-sm font-medium">Vacía</p>
            <p className="text-xs text-stone-400">Toca productos para agregar</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {activeItems.map((item) => {
              const itemExtrasTotal = item.extras.reduce((es, e) => es + e.price * e.qty, 0);
              return (
                <li key={item.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-700">{item.name}</p>
                      {item.modifiers.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.modifiers.map((m) => (
                            <span key={m} className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">{m}</span>
                          ))}
                        </div>
                      )}
                      {item.extras.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.extras.map((e) => (
                            <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                              {e.name} +{money(e.price)}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-0.5 text-xs text-stone-400">{money(item.price)} c/u</p>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-stone-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onChangeQty(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-semibold text-stone-700">{item.qty}</span>
                      <button onClick={() => onChangeQty(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="text-sm font-bold text-stone-700">{money((item.price + itemExtrasTotal) * item.qty)}</span>
                  </div>
                  <input value={item.note ?? ''} onChange={(e) => onSetItemNote(item.id, e.target.value)} placeholder="Nota..." className="mt-2 w-full rounded-md border border-stone-200 px-2 py-1.5 text-xs text-stone-600 outline-none focus:border-amber-400" />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-stone-200 p-4">
        <div className="mb-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex items-center justify-between text-stone-500">
            <span>Descuento</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onSetDiscount(Math.max(0, discount - 500))} className="flex h-6 w-6 items-center justify-center rounded bg-stone-100 hover:bg-stone-200"><Minus className="h-3 w-3" /></button>
              <input
                type="number"
                value={discount}
                onChange={(e) => onSetDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 rounded border border-stone-200 px-1 py-0.5 text-center text-sm font-medium text-stone-700 outline-none focus:border-amber-400"
              />
              <button onClick={() => onSetDiscount(discount + 500)} className="flex h-6 w-6 items-center justify-center rounded bg-stone-100 hover:bg-stone-200"><Plus className="h-3 w-3" /></button>
            </div>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-1.5 text-base font-bold text-stone-800"><span>Total</span><span>{money(total)}</span></div>
        </div>
        {activeItems.length > 0 && (
          <button onClick={() => onSetViewMode('preview')} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
            <Eye className="h-4 w-4" /> Vista previa
          </button>
        )}
        <button onClick={onSendToKitchen} disabled={activeItems.length === 0} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-700 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40">
          <Send className="h-4 w-4" /> Enviar a Cocina
        </button>
        {isCajero && activeItems.length > 0 && (
          <button onClick={() => onSetPayModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700">
            <Wallet className="h-4 w-4" /> Cobrar
          </button>
        )}
      </div>
    </aside>
  );
}
