import { AlertTriangle, ArrowLeftRight, Receipt, UtensilsCrossed, Wallet } from 'lucide-react';
import { money, getTableName } from '@/lib/format';
import type { Order, Product, Table } from '@/types';
import { KpiCard } from './ui/KpiCard';
import { Panel } from './ui/Panel';
import { Empty } from './ui/Empty';

interface DashboardTabProps {
  todayTotal: number;
  avgTicket: number;
  activeTableIds: number;
  outStock: Product[];
  orders: Order[];
  tables: Table[];
  toggleAvailable: (id: string) => void;
}

export function DashboardTab({ todayTotal, avgTicket, activeTableIds, outStock, orders, tables, toggleAvailable }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-800">Dashboard</h1>
        <p className="text-sm text-stone-500">Métricas del turno actual</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Wallet} label="Ventas" value={money(todayTotal)} tone="amber" />
        <KpiCard icon={Receipt} label="Ticket Promedio" value={money(avgTicket)} tone="stone" />
        <KpiCard icon={ArrowLeftRight} label="Mesas Activas" value={`${activeTableIds}`} tone="emerald" />
        <KpiCard icon={AlertTriangle} label="Agotados" value={`${outStock.length}`} tone="red" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Comandas Activas" icon={UtensilsCrossed}>
          {orders.filter((o) => o.status !== 'despachado').length === 0 ? (
            <Empty text="No hay comandas activas." />
          ) : (
            <ul className="space-y-2">
              {orders.filter((o) => o.status !== 'despachado').map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-stone-700">{o.ticket} · {o.destination.type === 'mesa' ? getTableName(tables, o.destination.tableId) : o.destination.type === 'barra' ? 'Barra' : 'Para Llevar'}</p>
                    <p className="text-xs text-stone-400">{o.items.length} ítems · {money(o.total)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    o.status === 'nuevo' ? 'bg-blue-100 text-blue-700' :
                    o.status === 'preparacion' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {o.status === 'nuevo' ? 'Nuevo' : o.status === 'preparacion' ? 'Preparación' : 'Listo'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Productos Agotados" icon={AlertTriangle}>
          {outStock.length === 0 ? (
            <Empty text="Todos los productos disponibles." />
          ) : (
            <ul className="space-y-2">
              {outStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
                  <span className="font-medium text-stone-700">{p.name}</span>
                  <button onClick={() => toggleAvailable(p.id)} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                    Activar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
