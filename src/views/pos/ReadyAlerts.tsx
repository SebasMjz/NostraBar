import { Bell, X } from 'lucide-react';
import type { Order, Table } from '@/types';

interface ReadyAlert {
  key: string;
  table?: Table;
  order?: Order;
}

interface ReadyAlertsProps {
  alerts: ReadyAlert[];
  onRecoger: (tableId: string, alertKey: string) => void;
  onDismiss: (alertKey: string) => void;
}

export function ReadyAlerts({ alerts, onRecoger, onDismiss }: ReadyAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      {alerts.map((alert) => (
        <div key={alert.key} className="mb-2 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 last:mb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">¡Pedido listo para despachar!</p>
              <p className="text-xs text-amber-700">{alert.table?.name} - Ticket {alert.order?.ticket}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onRecoger(alert.table!.id, alert.key); }} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
              Recoger
            </button>
            <button onClick={() => onDismiss(alert.key)} className="text-amber-400 hover:text-amber-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
