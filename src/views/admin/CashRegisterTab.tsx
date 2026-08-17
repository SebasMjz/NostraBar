import { Plus, Wallet } from 'lucide-react';
import { money } from '@/lib/format';
import type { PaymentMethod, Transaction } from '@/types';
import { Empty } from './ui/Empty';

const methodLabels: Record<PaymentMethod, string> = {
  qr: 'QR',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
};

interface CashRegisterTabProps {
  activeCashRegister: { initial_amount: number; opened_at: string } | null;
  openCashRegister: (amount: number) => void;
  closeCashRegister: (finalAmount: number, notes: string) => void;
  transactions: Transaction[];
}

export function CashRegisterTab({ activeCashRegister, openCashRegister, closeCashRegister, transactions }: CashRegisterTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-800">Control de Cajas y Turnos</h1>
          <p className="text-sm text-stone-500">Gestión de aperturas, arqueos independientes y cierres de caja</p>
        </div>
      </div>

      {/* Current Active Cash Register Status Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeCashRegister ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Estado de Caja Actual</h3>
              <p className="text-xs text-stone-400">
                {activeCashRegister
                  ? `Apertura realizada el ${new Date(activeCashRegister.opened_at).toLocaleString('es-CO')}`
                  : 'No hay ninguna caja abierta en este momento.'}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCashRegister ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {activeCashRegister ? '🟢 Caja Abierta' : '🔴 Caja Cerrada'}
          </span>
        </div>

        {activeCashRegister && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Fondo Inicial</p>
              <p className="text-xl font-bold text-stone-800 mt-1">{money(activeCashRegister.initial_amount)}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Ventas Efectivo</p>
              <p className="text-xl font-bold text-amber-900 mt-1">+{money(transactions.filter((t) => t.method === 'efectivo').reduce((s, t) => s + t.total, 0))}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Ventas QR</p>
              <p className="text-xl font-bold text-blue-900 mt-1">+{money(transactions.filter((t) => t.method === 'qr').reduce((s, t) => s + t.total, 0))}</p>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-800">Ventas Tarjeta</p>
              <p className="text-xl font-bold text-purple-900 mt-1">+{money(transactions.filter((t) => t.method === 'tarjeta').reduce((s, t) => s + t.total, 0))}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {activeCashRegister ? (
            <button
              onClick={() => {
                if (window.confirm('¿Proceder a realizar el arqueo y cierre de caja?')) {
                  closeCashRegister(
                    activeCashRegister.initial_amount + transactions.reduce((s, t) => s + t.total, 0),
                    'Cierre administrativo desde panel Admin'
                  );
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-black"
            >
              <Wallet className="h-4 w-4" /> Realizar Arqueo y Cierre de Caja
            </button>
          ) : (
            <button
              onClick={() => {
                const amountStr = window.prompt('Ingrese el monto de fondo inicial para abrir caja (Bs.):', '200');
                if (amountStr) {
                  const amount = parseFloat(amountStr);
                  if (!isNaN(amount) && amount >= 0) openCashRegister(amount);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Abrir Nueva Caja / Turno
            </button>
          )}
        </div>
      </div>

      {/* Audit History Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-stone-800">Resumen y Desglose de Ventas del Turno</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="p-3">Ticket</th>
                <th className="p-3">Mesa / Destino</th>
                <th className="p-3">Método de Pago</th>
                <th className="p-3 text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-stone-800">{tx.ticket}</td>
                  <td className="p-3 text-stone-600">{tx.label}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${
                      tx.method === 'efectivo' ? 'bg-amber-100 text-amber-800' :
                      tx.method === 'qr' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {methodLabels[tx.method]}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-stone-800">{money(tx.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && <Empty text="No hay transacciones registradas en este turno." />}
        </div>
      </div>
    </div>
  );
}
