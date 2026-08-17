import { useEffect, useState } from 'react';
import { CheckCircle2, ChefHat, Clock, Soup } from 'lucide-react';
import { destLabel, getTableName, useStore } from '@/store';
import type { Order, Table } from '@/types';

type KdsFilter = 'all' | 'barra' | 'cocina';

export function KdsView() {
  const { orders, tables, advanceOrder, toggleItemDone } = useStore();
  const [filter, setFilter] = useState<KdsFilter>('all');
  const [, force] = useState(0);

  // re-render every 10s for timers
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const active = orders.filter((o) => o.status !== 'despachado');
  const activeSorted = [...active].sort((a, b) => a.createdAt - b.createdAt);

  const barRegex = /espresso|cortado|capuccino|flat|latte|ristretto|v60|chemex|cold|iced|affogato|frappé|limonada|brew/i;
  const filtered = active.filter((o) => {
    if (filter === 'all') return true;
    const hasBar = o.items.some((i) => barRegex.test(i.name));
    if (filter === 'barra') return hasBar;
    if (filter === 'cocina') return o.items.some((i) => !barRegex.test(i.name));
    return true;
  });

  const columns: { key: Order['status']; title: string; icon: typeof Clock }[] = [
    { key: 'nuevo', title: 'Nuevos Pedidos', icon: Clock },
    { key: 'preparacion', title: 'En Preparación', icon: Soup },
    { key: 'listo', title: 'Listos para Servir', icon: CheckCircle2 },
  ];

  const avgWait = active.length
    ? Math.round(active.reduce((s, o) => s + (Date.now() - o.createdAt) / 60000, 0) / active.length)
    : 0;

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col bg-stone-950 text-stone-100">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 px-5 py-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-amber-400" />
            <span className="font-serif text-lg font-semibold text-white">NostraBar · KDS</span>
          </div>
          <LiveClock />
          <div className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-sm">
            <Clock className="h-4 w-4 text-stone-400" />
            <span className="text-stone-300">Órdenes activas:</span>
            <span className="font-bold text-amber-400">{active.length}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-sm">
            <span className="text-stone-300">Espera prom.:</span>
            <span className="font-bold text-emerald-400">{avgWait} min</span>
          </div>
        </div>

        <div className="flex gap-1.5 rounded-lg bg-stone-800 p-1">
          {(['all', 'barra', 'cocina'] as KdsFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'bg-amber-500 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f === 'all' ? 'Ver Todo' : f === 'barra' ? 'Solo Barra' : 'Solo Cocina'}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-3">
        {columns.map((col) => {
          const colOrders = filtered.filter((o) => o.status === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex flex-col overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60">
              <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-stone-400" />
                  <h2 className="text-sm font-semibold text-stone-200">{col.title}</h2>
                </div>
                <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs font-bold text-stone-300">{colOrders.length}</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {colOrders.length === 0 && (
                  <p className="py-8 text-center text-sm text-stone-600">Sin pedidos</p>
                )}
                {colOrders.map((o) => {
                  const queuePos = activeSorted.findIndex((item) => item.id === o.id) + 1;
                  return (
                    <OrderCard
                      key={o.id}
                      order={o}
                      queuePos={queuePos > 0 ? queuePos : 1}
                      tables={tables}
                      onAdvance={() => advanceOrder(o.id)}
                      onToggleItem={(itemId) => toggleItemDone(o.id, itemId)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-lg bg-stone-800 px-3 py-1.5 font-mono text-sm font-semibold text-emerald-400">
      {time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

function OrderCard({ order, queuePos, tables, onAdvance, onToggleItem }: { order: Order; queuePos: number; tables: Table[]; onAdvance: () => void; onToggleItem: (itemId: string) => void }) {
  const mins = Math.floor((Date.now() - order.createdAt) / 60000);
  const tone = mins < 5 ? 'emerald' : mins <= 10 ? 'amber' : 'red';
  const toneClasses = {
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    red: 'border-red-500/50 bg-red-500/15 text-red-400',
  };
  const pulse = tone === 'red' ? 'animate-pulse' : '';

  const allDone = order.items.every((i) => i.done);
  const nextLabel = order.status === 'nuevo' ? 'Tomar Pedido' : order.status === 'preparacion' ? 'Marcar Listo' : 'Despachar';
  const nextTone = order.status === 'nuevo' ? 'bg-blue-600 hover:bg-blue-500' : order.status === 'preparacion' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500';

  return (
    <div className="rounded-xl border border-stone-700 bg-stone-800/80 p-3 shadow-lg">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 min-w-[24px] items-center justify-center rounded bg-amber-500 px-1 font-mono text-xs font-black text-stone-950">
              #{queuePos}
            </span>
            <p className="text-sm font-bold text-white">{order.ticket}</p>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{order.destination.type === 'mesa' ? getTableName(tables, order.destination.tableId) : order.destination.type === 'barra' ? 'Barra' : 'Para Llevar'}</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-bold ${toneClasses[tone]} ${pulse}`}>
          <Clock className="h-3.5 w-3.5" />
          {mins}m
        </div>
      </div>

      <ul className="mb-3 space-y-1.5">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            <button
              onClick={() => onToggleItem(item.id)}
              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                item.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-600 bg-stone-700 text-transparent hover:border-stone-400'
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
            </button>
            <div className={`min-w-0 flex-1 ${item.done ? 'text-stone-500 line-through' : 'text-stone-200'}`}>
              <span className="font-medium">{item.qty}×</span> {item.name}
              {item.modifiers.length > 0 && (
                <span className="block text-xs text-amber-500/80">{item.modifiers.join(' · ')}</span>
              )}
              {item.note && (
                <span className="block text-xs italic text-stone-500">“{item.note}”</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={onAdvance}
        disabled={order.status === 'preparacion' && !allDone}
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${nextTone}`}
      >
        {nextLabel}
      </button>
    </div>
  );
}
