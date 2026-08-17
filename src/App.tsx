import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StoreProvider, useStore } from '@/store';
import { Header } from '@/components/Header';
import { AdminView } from '@/views/AdminView';
import { PosView } from '@/views/PosView';
import { KdsView } from '@/views/KdsView';
import { LoginView } from '@/views/LoginView';
import { Loader2 } from 'lucide-react';

function CurrentView() {
  const { role } = useStore();
  if (role === 'admin') return <AdminView />;
  if (role === 'cajero' || role === 'mesero') return <PosView />;
  return <KdsView />;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
          <p className="text-sm text-stone-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginView />;

  return (
    <StoreProvider>
      <div className="min-h-screen bg-stone-100 font-sans text-stone-800 antialiased">
        <Header />
        <CurrentView />
      </div>
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
