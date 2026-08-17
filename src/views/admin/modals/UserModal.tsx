import { Loader2, UserPlus, X } from 'lucide-react';
import type { Role } from '@/types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUserName: string;
  setNewUserName: (name: string) => void;
  newUserUsername: string;
  setNewUserUsername: (username: string) => void;
  newUserPassword: string;
  setNewUserPassword: (password: string) => void;
  newUserRole: Role;
  setNewUserRole: (role: Role) => void;
  handleCreateUser: () => void;
  creatingUser: boolean;
}

export function UserModal({ isOpen, onClose, newUserName, setNewUserName, newUserUsername, setNewUserUsername, newUserPassword, setNewUserPassword, newUserRole, setNewUserRole, handleCreateUser, creatingUser }: UserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">Nuevo Usuario</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Nombre completo</label>
            <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Nombre de usuario (Username)</label>
            <input value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} placeholder="Ej: meserojuan" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Contraseña</label>
            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Contraseña de acceso" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">Rol</label>
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as Role)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400">
              <option value="admin">Administrador</option>
              <option value="cajero">Cajero</option>
              <option value="mesero">Mesero</option>
              <option value="cocina">Cocina</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleCreateUser}
          disabled={creatingUser || !newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40">
          {creatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {creatingUser ? 'Creando...' : 'Crear Usuario'}
        </button>
      </div>
    </div>
  );
}
