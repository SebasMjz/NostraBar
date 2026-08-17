-- ============================================
-- LIMPIEZA COMPLETA - NostraBar
-- Ejecutar en SQL Editor para empezar de cero
-- ============================================

-- Eliminar datos de ordenes (dependen de otras tablas primero)
DELETE FROM payments;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cash_register_movements;
DELETE FROM cash_register;

-- Eliminar datos de productos
DELETE FROM product_modifiers;
DELETE FROM product_variants;
DELETE FROM modifiers;
DELETE FROM products;

-- Eliminar categorías y mesas
DELETE FROM categories;
DELETE FROM tables;

-- Eliminar profiles y usuarios de auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles;

DELETE FROM auth.users;

-- Verificar que todo está vacío
SELECT 'categories' as tabla, COUNT(*) as total FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'modifiers', COUNT(*) FROM modifiers
UNION ALL SELECT 'product_modifiers', COUNT(*) FROM product_modifiers
UNION ALL SELECT 'tables', COUNT(*) FROM tables
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'auth.users', COUNT(*) FROM auth.users;
