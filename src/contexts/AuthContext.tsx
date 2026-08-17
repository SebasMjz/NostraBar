import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Role } from '@/types';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  full_name: string;
  role: Role;
  active: boolean;
  password?: string;
}

interface AuthValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  createUser: (username: string, password: string, fullName: string, role: Role) => Promise<{ error?: string }>;
  listUsers: () => Promise<UserProfile[]>;
  toggleUserActive: (userId: string, active: boolean) => Promise<{ error?: string }>;
  deleteUser: (userId: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from DB or localStorage
  useEffect(() => {
    async function initAuth() {
      try {
        const stored = localStorage.getItem('nostrabar_current_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const getLocalUsers = (): UserProfile[] => {
    try {
      const stored = localStorage.getItem('nostrabar_custom_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalUsers = (users: UserProfile[]) => {
    try {
      localStorage.setItem('nostrabar_custom_users', JSON.stringify(users));
    } catch (err) {
      console.error('Error saving local users:', err);
    }
  };

  const listUsers = useCallback(async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          username: p.username || p.email?.split('@')[0] || p.full_name?.toLowerCase().replace(/\s+/g, '') || 'usuario',
          email: p.email,
          full_name: p.full_name || p.username || 'Usuario',
          role: p.role as Role,
          active: p.active !== false,
          password: p.password,
        }));
      }
    } catch (e) {
      console.warn('Using local profiles fallback:', e);
    }
    return getLocalUsers();
  }, []);

  const signIn = useCallback(async (usernameInput: string, passwordInput: string) => {
    const users = await listUsers();
    const cleanInput = usernameInput.trim().toLowerCase();

    const matched = users.find((u) =>
      u.username.toLowerCase() === cleanInput || u.email?.toLowerCase() === cleanInput
    );

    if (!matched) {
      return { error: 'Usuario no encontrado' };
    }

    if (matched.active === false) {
      return { error: 'Usuario inactivo. Contacta al administrador.' };
    }

    if (matched.password && matched.password !== passwordInput) {
      return { error: 'Contraseña incorrecta' };
    }

    setUser(matched);
    localStorage.setItem('nostrabar_current_user', JSON.stringify(matched));
    return {};
  }, [listUsers]);

  const signOut = useCallback(async () => {
    localStorage.removeItem('nostrabar_current_user');
    setUser(null);
  }, []);

  const createUser = useCallback(async (usernameInput: string, passwordInput: string, fullName: string, role: Role) => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const users = await listUsers();

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { error: 'El nombre de usuario ya existe' };
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username: cleanUsername,
      full_name: fullName.trim(),
      role,
      active: true,
      password: passwordInput,
    };

    try {
      await supabase.from('profiles').insert({
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        role: newUser.role,
        active: true,
        password: passwordInput,
      } as any);
    } catch (e) {
      console.warn('Supabase profile creation fallback to local:', e);
    }

    const updatedUsers = [...users, newUser];
    saveLocalUsers(updatedUsers);
    return {};
  }, [listUsers]);

  const toggleUserActive = useCallback(async (userId: string, active: boolean) => {
    const users = await listUsers();
    const updatedUsers = users.map((u) => u.id === userId ? { ...u, active } : u);
    saveLocalUsers(updatedUsers);

    try {
      await supabase.from('profiles').update({ active } as any).eq('id', userId);
    } catch (e) {
      console.warn('Supabase toggle active fallback:', e);
    }

    if (user?.id === userId && !active) {
      signOut();
    }

    return {};
  }, [listUsers, user, signOut]);

  const deleteUser = useCallback(async (userId: string) => {
    const users = await listUsers();
    const updatedUsers = users.filter((u) => u.id !== userId);
    saveLocalUsers(updatedUsers);

    try {
      await supabase.from('profiles').delete().eq('id', userId);
    } catch (e) {
      console.warn('Supabase delete user fallback:', e);
    }

    return {};
  }, [listUsers]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, createUser, listUsers, toggleUserActive, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
