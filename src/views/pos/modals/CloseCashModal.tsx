import { useState } from 'react';
import { X } from 'lucide-react';
import { money } from '@/lib/format';
import type { Transaction } from '@/types';

interface CloseCashModalProps {
  cashRegister: any;
  transactions: Transaction[];
  onClose: () => void;
  onConfirm: (finalAmount: number, notes?: string) => void;
}

export function CloseCashModal({ cashRegister, transactions, onClose, onConfirm }: CloseCashModalProps) {
  const initial = cashRegister.initial_amount || 0;
  const cashSales = transactions.filter((t) => t.method === 'efectivo').reduce((s, t) => s + t.total, 0);
  const qrSales = transactions.filter((t) => t.method === 'qr').reduce((s, t) => s + t.total, 0);
  const cardSales = transactions.filter((t) => t.method === 'tarjeta').reduce((s, t) => s + t.total, 0);

  const expectedCash = initial + cashSales;
  const expectedQr = qrSales;
  const expectedCard = cardSales;

  const [countedCash, setCountedCash] = useState<number>(expectedCash);
  const [countedQr, setCountedQr] = useState<number>(expectedQr);
  const [countedCard, setCountedCard] = useState<number>(expectedCard);
  const [notes, setNotes] = useState<string>('');

  const diffCash = countedCash - expectedCash;
  const diffQr = countedQr - expectedQr;
  const diffCard = countedCard - expectedCard;

  const renderBadge = (diff: number, label: string) => {
    if (diff === 0) return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">✓ {label} Cuadrado</span>;
    if (diff > 0) return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">+{money(diff)} (Sobrante)</span>;
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">-{money(Math.abs(diff))} (Faltante)</span>;
  };

  const handleConfirm = () => {
    const fullNotes = `Arqueo: Efectivo (${diffCash >= 0 ? '+' : ''}${diffCash}), QR (${diffQr >= 0 ? '+' : ''}${diffQr}), Tarjeta (${diffCard >= 0 ? '+' : ''}${diffCard}) | ${notes}`.trim();
    onConfirm(countedCash, fullNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-stone-900 px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-bold">Cuadre e Arqueo de Caja</h3>
            <p className="text-xs text-stone-400">Verificación independiente por método de pago</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[82vh] overflow-y-auto p-5 space-y-4">

          {/* Arqueo Efectivo */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">1. Arqueo en Efectivo Físico</span>
              {renderBadge(diffCash, 'Efectivo')}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Fondo Inicial ({money(initial)}) + Ventas Efectivo ({money(cashSales)}):</span>
              <strong className="text-amber-900 font-bold">{money(expectedCash)}</strong>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Monto en Efectivo Físico Contado:</label>
              <input
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-right text-base font-bold text-stone-800 outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Arqueo QR */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">2. Arqueo Pago QR</span>
              {renderBadge(diffQr, 'QR')}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Ventas QR Registradas en Sistema:</span>
              <strong className="text-blue-900 font-bold">{money(expectedQr)}</strong>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Monto Verificado en Banco/Comprobantes QR:</label>
              <input
                type="number"
                value={countedQr}
                onChange={(e) => setCountedQr(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-right text-base font-bold text-stone-800 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Arqueo Tarjeta */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">3. Arqueo Tarjeta de Crédito/Débito</span>
              {renderBadge(diffCard, 'Tarjeta')}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Ventas Tarjeta Registradas en Sistema:</span>
              <strong className="text-purple-900 font-bold">{money(expectedCard)}</strong>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Monto en Vouchers Posnet/POS:</label>
              <input
                type="number"
                value={countedCard}
                onChange={(e) => setCountedCard(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-right text-base font-bold text-stone-800 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Observaciones / Justificación de Arqueo:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Faltante de Bs. 5 por cambio en efectivo..."
              rows={2}
              className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-stone-400"
            />
          </div>

          <button
            onClick={handleConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-black"
          >
            Confirmar Arqueo e Imprimir Cierre de Caja
          </button>
        </div>
      </div>
    </div>
  );
}
