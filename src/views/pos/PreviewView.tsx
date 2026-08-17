import { Send } from 'lucide-react';
import { money } from '@/lib/format';
import type { OrderItem } from '@/types';

interface PreviewViewProps {
  activeItems: OrderItem[];
  total: number;
  onBack: () => void;
  onSendToKitchen: () => void;
}

export function PreviewView({ activeItems, total, onBack, onSendToKitchen }: PreviewViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <button onClick={onBack} className="mb-2 text-sm text-stone-400 hover:text-stone-600">← Volver al catálogo</button>
        <h2 className="font-serif text-xl font-semibold text-stone-800">Vista previa del pedido</h2>
        <p className="text-sm text-stone-500">Revisa antes de enviar a cocina</p>
      </div>
      {activeItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-stone-400">No hay ítems en la comanda</p>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <ul className="divide-y divide-stone-100">
            {activeItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-stone-700">{item.name}</span>
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
                  {item.note && <p className="text-xs text-stone-400">{item.note}</p>}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-stone-200 p-4">
            <div className="mb-3 flex justify-between text-base font-bold text-stone-800">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={onBack} className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                Seguir agregando
              </button>
              <button onClick={onSendToKitchen} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900">
                <Send className="h-4 w-4" /> Enviar a Cocina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
