import { useState } from 'react';
import { Wallet, X } from 'lucide-react';

interface OpenCashModalProps {
  onClose: () => void;
  onConfirm: (initialAmount: number) => void;
}

export function OpenCashModal({ onClose, onConfirm }: OpenCashModalProps) {
  const [amount, setAmount] = useState<number>(200);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">Apertura de Caja</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-4 text-xs text-stone-500">Ingresa el monto de fondo inicial entregado a caja para el turno de hoy.</p>
        <div className="mb-5">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Fondo Inicial (Bs.)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-stone-300 bg-stone-50 py-3 px-4 text-xl font-bold text-stone-800 outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <button
          onClick={() => onConfirm(amount)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
        >
          <Wallet className="h-4 w-4" /> Abrir Caja e Iniciar Turno
        </button>
      </div>
    </div>
  );
}
