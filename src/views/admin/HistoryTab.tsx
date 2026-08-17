import React from 'react';
import { Printer, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { money } from '@/lib/format';
import type { Order, PaymentMethod, Transaction } from '@/types';
import { KpiCard } from './ui/KpiCard';

const methodLabels: Record<PaymentMethod, string> = {
  qr: 'QR',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
};

interface HistoryTabProps {
  todayTotal: number;
  avgTicket: number;
  transactions: Transaction[];
  orders: Order[];
  expandedTxId: string | null;
  setExpandedTxId: (id: string | null) => void;
  printReceipt: (orderId: string) => void;
}

export function HistoryTab({ todayTotal, avgTicket, transactions, orders, expandedTxId, setExpandedTxId, printReceipt }: HistoryTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-800">Historial</h1>
        <p className="text-sm text-stone-500">Transacciones del día</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Wallet} label="Total" value={money(todayTotal)} tone="amber" small />
        <KpiCard icon={Receipt} label="Transacciones" value={`${transactions.length}`} tone="stone" small />
        <KpiCard icon={TrendingUp} label="Promedio" value={money(avgTicket)} tone="emerald" small />
      </div>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Ticket</th>
              <th className="px-4 py-3 font-semibold">Origen</th>
              <th className="px-4 py-3 font-semibold">Método</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {transactions.map((t) => {
              const isExpanded = expandedTxId === t.id;
              const matchedOrder = orders.find((o) => o.ticket === t.ticket);
              return (
                <React.Fragment key={t.id}>
                  <tr
                    onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                    className="cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-stone-700 flex items-center gap-2">
                      <span className="text-stone-400 text-xs font-bold">{isExpanded ? '▲' : '▼'}</span>
                      {t.ticket}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{t.label}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        t.method === 'qr' ? 'bg-violet-100 text-violet-700' :
                        t.method === 'tarjeta' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{methodLabels[t.method]}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-700">{money(t.total)}</td>
                    <td className="px-4 py-3 text-stone-400">{new Date(t.time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2">
                            <h4 className="text-sm font-bold text-stone-800">Detalle del Ticket {t.ticket} ({t.label})</h4>
                            {matchedOrder && (
                              <button onClick={(e) => { e.stopPropagation(); printReceipt(matchedOrder.id); }} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50">
                                <Printer className="h-3.5 w-3.5" /> Imprimir Recibo
                              </button>
                            )}
                          </div>
                          {matchedOrder && matchedOrder.items ? (
                            <ul className="divide-y divide-stone-100 text-xs">
                              {matchedOrder.items.map((item) => (
                                <li key={item.id} className="py-2 flex justify-between">
                                  <div>
                                    <span className="font-semibold text-stone-800">{item.qty}x {item.name}</span>
                                    {item.modifiers.length > 0 && <p className="text-[10px] text-amber-600">{item.modifiers.join(', ')}</p>}
                                    {item.extras.length > 0 && (
                                      <p className="text-[10px] text-violet-600">{item.extras.map((e) => `${e.name} (+${money(e.price)})`).join(', ')}</p>
                                    )}
                                  </div>
                                  <span className="font-bold text-stone-700">{money(item.price * item.qty)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-stone-500 italic">Venta registrada - Total: {money(t.total)} en {methodLabels[t.method]}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
