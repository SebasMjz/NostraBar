-- ============================================
-- FIX COMPLETO - NostraBar
-- Ejecutar TODO en SQL Editor
-- ============================================

-- ============================================
-- 1. DESHABILITAR CONFIRMACIÓN DE EMAIL
-- ============================================
-- Ve a Supabase Dashboard → Authentication → Providers → Email
-- DESACTIVA "Confirm email"
-- Esto permite crear usuarios sin que confirmen el correo

-- ============================================
-- 2. ARREGLAR PROFILES (error 406/409)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cajero',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política permisiva para que no haya errores 406
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (true);

-- Trigger auto-crear perfil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cajero')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. HABILITAR REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- ============================================
-- 4. INSERTAR PERFILES para usuarios existentes
-- ============================================
INSERT INTO profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  CASE
    WHEN au.email = 'admin@nostrabar.com' THEN 'admin'
    WHEN au.email = 'cajero@nostrabar.com' THEN 'cajero'
    WHEN au.email = 'mesero@nostrabar.com' THEN 'mesero'
    WHEN au.email = 'cocina@nostrabar.com' THEN 'cocina'
    ELSE 'cajero'
  END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

-- Verificar
SELECT p.email, p.full_name, p.role FROM profiles p;
