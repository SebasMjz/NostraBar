import type React from 'react';
import type { TrendingUp } from 'lucide-react';

export function Panel({ title, icon: Icon, children }: { title: string; icon: typeof TrendingUp; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}
