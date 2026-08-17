import { useState } from 'react';
import { Coffee, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginView() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(username, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-700 to-stone-800 text-white shadow-lg">
            <Coffee className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-800">NostraBar</h1>
          <p className="mt-1 text-sm text-stone-500">Inicia sesión con tu usuario y contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: admin, cajero, mesero"
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-900 disabled:opacity-50 shadow-md"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
