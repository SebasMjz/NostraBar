-- ============================================
-- TABLA PROFILES + TRIGGER - NostraBar
-- Ejecutar DESPUÉS de schema.sql
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cajero',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- USUARIOS (crear desde Dashboard después)
-- ============================================
-- Ve a Authentication → Users → Add user
-- Crea estos usuarios con Auto Confirm: ✓
--
--   admin@nostrabar.com  / admin123
--   cajero@nostrabar.com / cajero123
--   mesero@nostrabar.com / mesero123
--   cocina@nostrabar.com / cocina123
--
-- Después ejecuta el INSERT de abajo

-- INSERTAR PERFILES para usuarios existentes
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
