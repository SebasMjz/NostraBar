import type { TrendingUp } from 'lucide-react';

export function KpiCard({ icon: Icon, label, value, tone, small }: { icon: typeof TrendingUp; label: string; value: string; tone: 'amber' | 'stone' | 'emerald' | 'red'; small?: boolean }) {
  const tones = { amber: 'from-amber-500 to-amber-600 text-amber-50', stone: 'from-stone-600 to-stone-700 text-stone-50', emerald: 'from-emerald-500 to-emerald-600 text-emerald-50', red: 'from-red-500 to-red-600 text-red-50' };
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{label}</p>
          <p className={`font-semibold text-stone-800 ${small ? 'text-lg' : 'text-xl'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
