-- ============================================
-- FIX: Profiles + Auth - Versión simplificada
-- Ejecuta esto en SQL Editor de Supabase
-- ============================================

-- 1. Eliminar políticas RLS anteriores si existen
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Eliminar trigger y función anteriores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Recrear profiles con RLS simplificado
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cajero', 'mesero', 'cocina')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política simple: cada usuario puede leer su propio perfil
CREATE POLICY "read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: permitir lectura a service_role (para admin listando usuarios)
CREATE POLICY "service_role_full_access" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Política: permitir INSERT al service_role (para trigger y admin)
CREATE POLICY "service_role_insert" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Política: permitir UPDATE al service_role
CREATE POLICY "service_role_update" ON profiles
  FOR UPDATE USING (auth.role() = 'service_role');

-- Política: permitir DELETE al service_role
CREATE POLICY "service_role_delete" ON profiles
  FOR DELETE USING (auth.role() = 'service_role');

-- 4. Recrear trigger simplificado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cajero')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Insertar perfiles para usuarios existentes en auth.users
-- (por si el trigger no se disparó al insertar directamente)
INSERT INTO profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  COALESCE(au.raw_user_meta_data->>'role', 'cajero')
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- 6. Verificar
SELECT au.email, p.full_name, p.role
FROM auth.users au
JOIN profiles p ON p.id = au.id;
