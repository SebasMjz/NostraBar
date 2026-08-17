import { useState } from 'react';
import { Coffee, LayoutDashboard, LogOut, Monitor, Settings, ShoppingCart, Users } from 'lucide-react';
import { useStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import type { Role } from '@/types';

const roles: { id: Role; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'admin', label: 'Administrador', icon: LayoutDashboard },
  { id: 'cajero', label: 'Cajero', icon: ShoppingCart },
  { id: 'mesero', label: 'Mesero', icon: Users },
  { id: 'kds', label: 'Barista / Cocina', icon: Monitor },
];

export function Header() {
  const { role, setRole } = useStore();
  const { user, signOut } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Filtrar roles según el rol del usuario
  const visibleRoles = user?.role === 'admin'
    ? roles
    : roles.filter((r) => r.id === user?.role);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-stone-200 bg-stone-50/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-700 to-stone-800 text-white shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg font-semibold tracking-tight text-stone-800">NostraBar</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Café de Especialidad</p>
          </div>
        </div>

        {visibleRoles.length > 1 && (
          <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
            {visibleRoles.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    active ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-800 text-[10px] font-bold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline">{user?.full_name}</span>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-stone-200 bg-white py-1 shadow-xl">
                <div className="border-b border-stone-100 px-4 py-3">
                  <p className="text-sm font-semibold text-stone-800">{user?.full_name}</p>
                  <p className="text-xs text-stone-400">{user?.email}</p>
                  <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-stone-600">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => { setShowPasswordModal(true); setShowMenu(false); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                >
                  <Settings className="h-4 w-4" /> Cambiar contraseña
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </>
  );
}
