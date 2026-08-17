import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

// Configuracion de Supabase
// IMPORTANTE: Reemplaza estas variables con tus valores reales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU-ANON-KEY';

// Cliente Supabase tipado
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Tipos exportados para uso en la app
export type { Database } from '../src/types/database';
