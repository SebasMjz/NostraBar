import { useState } from 'react';
import { X, Lock, Loader2, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: Props) {
  const { changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const result = await changePassword(newPassword);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-stone-400" />
            <h3 className="text-base font-semibold text-stone-800">Cambiar Contraseña</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <Check className="h-4 w-4" />
            Contraseña actualizada correctamente
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {loading ? 'Guardando...' : 'Guardar Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
