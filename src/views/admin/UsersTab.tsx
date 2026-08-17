import { Loader2, Trash2, UserPlus } from 'lucide-react';
import type { UserProfile } from '@/contexts/AuthContext';

interface UsersTabProps {
  usersList: UserProfile[];
  usersLoading: boolean;
  setIsUserModalOpen: (open: boolean) => void;
  handleDeleteUser: (userId: string) => void;
  toggleUserActive: (userId: string, active: boolean) => Promise<{ error?: string }>;
  currentUser: UserProfile | null;
}

export function UsersTab({ usersList, usersLoading, setIsUserModalOpen, handleDeleteUser, toggleUserActive, currentUser }: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-800">Usuarios</h1>
          <p className="text-sm text-stone-500">Gestionar usuarios del sistema</p>
        </div>
        <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
          <UserPlus className="h-4 w-4" /> Nuevo Usuario
        </button>
      </div>

      {usersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3 font-medium text-stone-700">{u.full_name}</td>
                  <td className="px-4 py-3 text-stone-500 font-mono text-xs">@{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                      u.role === 'cajero' ? 'bg-blue-100 text-blue-700' :
                      u.role === 'mesero' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-violet-100 text-violet-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUserActive(u.id, !u.active)}
                      disabled={u.id === currentUser?.id}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        u.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {u.active ? '● Activo' : '○ Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== currentUser?.id && (
                      <button onClick={() => handleDeleteUser(u.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-stone-400">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
        <p className="font-semibold text-stone-600">Nota:</p>
        <p>La contraseña por defecto es <code className="rounded bg-stone-200 px-1 py-0.5 font-mono text-stone-700">{'{rol}{nombre}'}</code>. Ejemplo: para "Juan" con rol cajero, la contraseña es <code className="rounded bg-stone-200 px-1 py-0.5 font-mono text-stone-700">cajerojuan</code>.</p>
      </div>
    </div>
  );
}
