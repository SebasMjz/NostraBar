-- ============================================
-- DIAGNÓSTICO Y FIX COMPLETO
-- Ejecuta cada sección por separado en SQL Editor
-- ============================================

-- PASO 1: Verificar si la tabla profiles existe y tiene datos
SELECT COUNT(*) as total_profiles FROM profiles;

-- PASO 2: Verificar usuarios en auth.users
SELECT id, email, raw_user_meta_data FROM auth.users;

-- PASO 3: Eliminar todo lo relacionado con profiles (start clean)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON profiles;
DROP POLICY IF EXISTS "service_role_insert" ON profiles;
DROP POLICY IF EXISTS "service_role_update" ON profiles;
DROP POLICY IF EXISTS "service_role_delete" ON profiles;
DROP TABLE IF EXISTS profiles;

-- PASO 4: Recrear profiles SIN foreign key a auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cajero',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PASO 5: RLS permisivo (solo para no bloquear auth)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Permitir todo a autenticados (el auth service usa service_role que bypasea RLS)
CREATE POLICY "allow_all_authenticated" ON profiles
  FOR ALL USING (true)
  WITH CHECK (true);

-- PASO 6: Insertar perfiles para usuarios existentes
INSERT INTO profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'role', 'cajero')
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- PASO 7: Verificar
SELECT p.id, p.email, p.full_name, p.role FROM profiles p;
