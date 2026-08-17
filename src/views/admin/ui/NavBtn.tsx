import type { TrendingUp } from 'lucide-react';

export function NavBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof TrendingUp; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
