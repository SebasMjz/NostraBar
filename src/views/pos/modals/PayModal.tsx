import { useState } from 'react';
import { CheckCircle2, Printer, X } from 'lucide-react';
import { money, destLabel } from '@/lib/format';
import type { Order, PaymentSplit } from '@/types';

interface PayModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (payments: PaymentSplit[]) => void;
  onPrint: (orderId: string) => void;
}

export function PayModal({ order, onClose, onConfirm, onPrint }: PayModalProps) {
  const [docType, setDocType] = useState('Nota de Venta (Sin Factura)');
  const [clientName, setClientName] = useState('Público en General');
  const [payMode, setPayMode] = useState<'efectivo' | 'qr' | 'tarjeta' | 'mixto'>('efectivo');

  const [cashAmount, setCashAmount] = useState<number>(payMode === 'efectivo' ? order.total : 0);
  const [qrAmount, setQrAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [tenderedAmount, setTenderedAmount] = useState<number>(order.total);
  const [paid, setPaid] = useState(false);

  const totalMixtoEntered = cashAmount + qrAmount + cardAmount;
  const isMixtoValid = payMode === 'mixto' ? Math.abs(totalMixtoEntered - order.total) < 0.01 : true;
  const changeAmount = payMode === 'efectivo' ? Math.max(0, tenderedAmount - order.total) : 0;
  const isCashInsufficient = payMode === 'efectivo' && tenderedAmount < order.total;

  const selectMode = (mode: 'efectivo' | 'qr' | 'tarjeta' | 'mixto') => {
    setPayMode(mode);
    if (mode === 'efectivo') {
      setCashAmount(order.total);
      setQrAmount(0);
      setCardAmount(0);
      setTenderedAmount(order.total);
    } else if (mode === 'qr') {
      setCashAmount(0);
      setQrAmount(order.total);
      setCardAmount(0);
    } else if (mode === 'tarjeta') {
      setCashAmount(0);
      setQrAmount(0);
      setCardAmount(order.total);
    } else if (mode === 'mixto') {
      const half = Math.floor(order.total / 2);
      setCashAmount(half);
      setQrAmount(order.total - half);
      setCardAmount(0);
    }
  };

  const getFinalPayments = (): PaymentSplit[] => {
    if (payMode === 'efectivo') return [{ method: 'efectivo', amount: order.total }];
    if (payMode === 'qr') return [{ method: 'qr', amount: order.total }];
    if (payMode === 'tarjeta') return [{ method: 'tarjeta', amount: order.total }];
    const splits: PaymentSplit[] = [];
    if (cashAmount > 0) splits.push({ method: 'efectivo', amount: cashAmount });
    if (qrAmount > 0) splits.push({ method: 'qr', amount: qrAmount });
    if (cardAmount > 0) splits.push({ method: 'tarjeta', amount: cardAmount });
    return splits.length > 0 ? splits : [{ method: 'efectivo', amount: order.total }];
  };

  const billPresets = [
    { label: 'Exacto', value: order.total },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
  ].filter((b) => b.label === 'Exacto' || b.value >= order.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-900 px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-bold">Resumen de Cobro</h3>
            <p className="text-xs text-stone-400 mt-0.5">{order.ticket} · {destLabel(order.destination, [])}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Tipo de Documento</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-800 outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Nota de Venta (Sin Factura)">Nota de Venta (Sin Factura)</option>
                <option value="Factura con NIT/CI">Factura con NIT/CI</option>
                <option value="Ticket Interno de Comanda">Ticket Interno de Comanda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre del Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-800 outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Método de Pago</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => selectMode('efectivo')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'efectivo'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base font-bold">$</span>
                <span className="text-[11px] font-bold mt-0.5">Efectivo</span>
              </button>
              <button
                onClick={() => selectMode('qr')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'qr'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base">📱</span>
                <span className="text-[11px] font-bold mt-0.5">QR</span>
              </button>
              <button
                onClick={() => selectMode('tarjeta')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'tarjeta'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base">💳</span>
                <span className="text-[11px] font-bold mt-0.5">Tarjeta</span>
              </button>
              <button
                onClick={() => selectMode('mixto')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'mixto'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base">💼</span>
                <span className="text-[11px] font-bold mt-0.5">Mixto</span>
              </button>
            </div>
          </div>

          {payMode === 'efectivo' && (
            <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/40 p-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Monto Entregado por Cliente (Paga con):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Bs.</span>
                  <input
                    type="number"
                    value={tenderedAmount || ''}
                    onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-base font-bold text-stone-800 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {billPresets.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => setTenderedAmount(b.value)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                      tenderedAmount === b.value
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {b.label === 'Exacto' ? 'Exacto' : `Bs. ${b.value}`}
                  </button>
                ))}
              </div>

              <div className={`rounded-xl border p-2.5 text-center ${
                isCashInsufficient ? 'border-red-200 bg-red-50 text-red-700' : 'border-teal-200 bg-teal-100/80 text-teal-900'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {isCashInsufficient ? 'Monto Insuficiente' : 'Cambio / Vuelto a Entregar'}
                </p>
                <p className={`text-xl font-black ${isCashInsufficient ? 'text-red-600' : 'text-teal-800'}`}>
                  {money(changeAmount)}
                </p>
              </div>
            </div>
          )}

          {payMode === 'mixto' && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600">DESGLOSE DE PAGO MIXTO</p>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Monto en Efectivo</label>
                <input
                  type="number"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-right text-sm font-mono font-bold text-stone-800 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Monto en QR</label>
                <input
                  type="number"
                  value={qrAmount || ''}
                  onChange={(e) => setQrAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-right text-sm font-mono font-bold text-stone-800 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Monto en Tarjeta</label>
                <input
                  type="number"
                  value={cardAmount || ''}
                  onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-right text-sm font-mono font-bold text-stone-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-stone-200">
                <span className="text-stone-600">Total Ingresado:</span>
                <span className={isMixtoValid ? 'text-teal-700' : 'text-red-600'}>
                  {money(totalMixtoEntered)} / {money(order.total)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-stone-200 space-y-1">
            <div className="flex justify-between text-xs font-semibold text-stone-500">
              <span>Subtotal:</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-base font-extrabold text-stone-800">
              <span>Total:</span>
              <span className="text-2xl text-teal-600 font-black">{money(order.total)}</span>
            </div>
          </div>

          {!paid ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setPaid(true);
                  onConfirm(getFinalPayments());
                  onPrint(order.id);
                }}
                disabled={!isMixtoValid || isCashInsufficient}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="h-4 w-4" /> Completar Venta e Imprimir Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-center">
                <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> ¡Venta Registrada Exitosamente!
                </p>
              </div>

              <div className="rounded-xl border border-stone-300 bg-amber-50/40 p-4 shadow-inner text-stone-900 font-mono text-xs space-y-2">
                <div className="text-center border-b border-dashed border-stone-400 pb-2">
                  <p className="font-extrabold text-sm text-stone-900 uppercase">NostraBar</p>
                  <p className="text-[10px] text-stone-500">Cafetería de Especialidad</p>
                  <p className="font-bold text-stone-800 text-xs mt-1">{order.ticket}</p>
                  <p className="text-[10px] text-stone-600">{docType} · {clientName}</p>
                  <p className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                </div>

                <div className="space-y-1 py-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-[11px]">
                      <div>
                        <span>{item.qty}x {item.name}</span>
                        {item.modifiers.length > 0 && <p className="text-[9px] text-amber-800">({item.modifiers.join(', ')})</p>}
                        {item.extras.map((e) => (
                          <p key={e.id} className="text-[9px] text-stone-500"> + {e.name} ({money(e.price)})</p>
                        ))}
                      </div>
                      <span className="font-bold">{money((item.price + item.extras.reduce((s, e) => s + e.price * e.qty, 0)) * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-stone-400 pt-2 space-y-0.5 text-[11px]">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{money(order.subtotal)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-red-600"><span>Descuento:</span><span>-{money(order.discount)}</span></div>}
                  <div className="flex justify-between font-extrabold text-xs text-stone-900 pt-1 border-t border-stone-800">
                    <span>TOTAL COMPRA:</span>
                    <span>{money(order.total)}</span>
                  </div>
                  {payMode === 'efectivo' && changeAmount > 0 && (
                    <div className="flex justify-between text-[10px] text-stone-600 pt-1">
                      <span>Cambio / Vuelto:</span>
                      <span className="font-bold">{money(changeAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-stone-500 pt-2 border-t border-dashed border-stone-300">
                  ¡Gracias por su visita!
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onPrint(order.id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-xs font-bold text-white hover:bg-stone-900 shadow-md"
                >
                  <Printer className="h-4 w-4" /> Re-Imprimir Ticket
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white hover:bg-teal-700 shadow-md"
                >
                  ✓ Cerrar Venta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
