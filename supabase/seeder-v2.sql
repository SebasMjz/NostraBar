-- ============================================
-- SEEDER COMPLETO - NostraBar (UUIDs automáticos)
-- Ejecutar DESPUÉS de schema.sql y clean-all.sql
-- ============================================

-- ============================================
-- CATEGORÍAS
-- ============================================
INSERT INTO categories (name, description) VALUES
  ('Espresso Bar', 'Bebidas de espresso y derivados'),
  ('Filtrados', 'Cafés filtrados V60, Chemex, etc.'),
  ('Bebidas Frías', 'Cafés y bebidas frías'),
  ('Pastelería', 'Panadería, postres y brunch'),
  ('Lácteos', 'Leches y cremas'),
  ('Descartables', 'Vasos, tapas, servilletas'),
  ('Extras', 'Adicionales con precio');

-- ============================================
-- PRODUCTOS - Espresso Bar
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('Espresso Simple', 'barra', true),
  ('Espresso Doble', 'barra', true),
  ('Cortado', 'barra', true),
  ('Capuccino', 'barra', true),
  ('Flat White', 'barra', true),
  ('Latte Vainilla', 'barra', true),
  ('Ristretto', 'barra', true)
) AS p(name, station, available)
WHERE c.name = 'Espresso Bar';

-- Variantes Espresso
INSERT INTO product_variants (product_id, name, price, available)
SELECT pr.id, v.name, v.price, v.available
FROM products pr, (VALUES
  ('Espresso Simple', 'Simple', 1800, true),
  ('Espresso Doble', 'Doble', 2100, true),
  ('Cortado', 'Simple', 2400, true),
  ('Capuccino', 'Mediano', 2800, true),
  ('Capuccino', 'Grande', 3200, true),
  ('Flat White', 'Mediano', 3000, true),
  ('Flat White', 'Grande', 3400, true),
  ('Latte Vainilla', 'Mediano', 3200, true),
  ('Latte Vainilla', 'Grande', 3600, true),
  ('Ristretto', 'Simple', 2200, true)
) AS v(product_name, name, price, available)
WHERE pr.name = v.product_name;

-- ============================================
-- PRODUCTOS - Filtrados
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('V60 Etiopía Yirgacheffe', 'barra', true),
  ('V60 Colombia Huila', 'barra', true),
  ('Chemex Geisha Panamá', 'barra', true),
  ('Cold Brew Concentrado', 'barra', true)
) AS p(name, station, available)
WHERE c.name = 'Filtrados';

INSERT INTO product_variants (product_id, name, price, available)
SELECT pr.id, v.name, v.price, v.available
FROM products pr, (VALUES
  ('V60 Etiopía Yirgacheffe', 'Taza', 4200, true),
  ('V60 Colombia Huila', 'Taza', 4000, true),
  ('Chemex Geisha Panamá', 'Taza', 5800, true),
  ('Cold Brew Concentrado', 'Taza', 3600, true)
) AS v(product_name, name, price, available)
WHERE pr.name = v.product_name;

-- ============================================
-- PRODUCTOS - Bebidas Frías
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('Iced Latte', 'barra', true),
  ('Affogato', 'barra', true),
  ('Frappé Mocha', 'barra', true),
  ('Limonada de Hierbas', 'barra', true)
) AS p(name, station, available)
WHERE c.name = 'Bebidas Frías';

INSERT INTO product_variants (product_id, name, price, available)
SELECT pr.id, v.name, v.price, v.available
FROM products pr, (VALUES
  ('Iced Latte', 'Mediano', 3400, true),
  ('Iced Latte', 'Grande', 3800, true),
  ('Affogato', 'Mediano', 3900, true),
  ('Frappé Mocha', 'Mediano', 4200, true),
  ('Frappé Mocha', 'Grande', 4600, true),
  ('Limonada de Hierbas', 'Taza', 2800, true)
) AS v(product_name, name, price, available)
WHERE pr.name = v.product_name;

-- ============================================
-- PRODUCTOS - Pastelería
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('Croissant de Mantequilla', 'cocina', true),
  ('Croissant de Almendras', 'cocina', true),
  ('Cheesecake Frutos Rojos', 'cocina', true),
  ('Brownie de Chocolate 70%', 'cocina', false),
  ('Avocado Toast', 'cocina', true),
  ('Bowl de Frutas', 'cocina', true),
  ('Tostada Francesa', 'cocina', true)
) AS p(name, station, available)
WHERE c.name = 'Pastelería';

INSERT INTO product_variants (product_id, name, price, available)
SELECT pr.id, v.name, v.price, v.available
FROM products pr, (VALUES
  ('Croissant de Mantequilla', 'Unidad', 2600, true),
  ('Croissant de Almendras', 'Unidad', 3000, true),
  ('Cheesecake Frutos Rojos', 'Porción', 3800, true),
  ('Brownie de Chocolate 70%', 'Unidad', 3200, true),
  ('Avocado Toast', 'Plato', 5200, true),
  ('Bowl de Frutas', 'Bowl', 3600, true),
  ('Tostada Francesa', 'Plato', 4800, true)
) AS v(product_name, name, price, available)
WHERE pr.name = v.product_name;

-- ============================================
-- PRODUCTOS - Lácteos (sin precio)
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('Leche Entera', 'barra', true),
  ('Leche Deslactosada', 'barra', true),
  ('Leche de Almendra', 'barra', true),
  ('Crema de Leche', 'cocina', true),
  ('Aguacate', 'cocina', true)
) AS p(name, station, available)
WHERE c.name = 'Lácteos';

-- ============================================
-- PRODUCTOS - Descartables (sin precio)
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('Vaso 8oz', 'barra', true),
  ('Vaso 12oz', 'barra', true),
  ('Tapa Negra', 'barra', true),
  ('Servilletas (paq)', 'cocina', true)
) AS p(name, station, available)
WHERE c.name = 'Descartables';

-- ============================================
-- PRODUCTOS - Extras (con precio)
-- ============================================
INSERT INTO products (category_id, name, station, available)
SELECT c.id, p.name, p.station, p.available
FROM categories c, (VALUES
  ('Crema Extra', 'barra', true),
  ('Shot Espresso Extra', 'barra', true),
  ('Chocolate / Cacao', 'barra', true)
) AS p(name, station, available)
WHERE c.name = 'Extras';

INSERT INTO product_variants (product_id, name, price, available)
SELECT pr.id, v.name, v.price, v.available
FROM products pr, (VALUES
  ('Crema Extra', 'Porción', 800, true),
  ('Shot Espresso Extra', 'Shot', 1200, true),
  ('Chocolate / Cacao', 'Porción', 600, true)
) AS v(product_name, name, price, available)
WHERE pr.name = v.product_name;

-- ============================================
-- PERSONALIZACIONES
-- ============================================
INSERT INTO modifiers (name, category, price_modifier, available) VALUES
  ('Leche Almendra', 'leche', 0, true),
  ('Leche Deslactosada', 'leche', 0, true),
  ('Sin Azúcar', 'endulzante', 0, true),
  ('Vainilla Extra', 'sabor', 0, true),
  ('Cacao Extra', 'sabor', 0, true),
  ('Hielo Extra', 'preparación', 0, true),
  ('Taza Precalentada', 'preparación', 0, true),
  ('Sin Cebolla', 'preparación', 0, true),
  ('Huevo Extra', 'adicional', 0, true),
  ('Miel Extra', 'adicional', 0, true),
  ('Crema Extra', 'adicional', 0, true);

-- Relacionar personalizaciones con productos
INSERT INTO product_modifiers (product_id, modifier_id)
SELECT pr.id, m.id
FROM products pr, modifiers m
WHERE
  (pr.name = 'Cortado' AND m.name IN ('Leche Almendra', 'Leche Deslactosada', 'Sin Azúcar'))
  OR (pr.name = 'Capuccino' AND m.name IN ('Leche Almendra', 'Leche Deslactosada', 'Sin Azúcar', 'Cacao Extra'))
  OR (pr.name = 'Flat White' AND m.name IN ('Leche Almendra', 'Leche Deslactosada'))
  OR (pr.name = 'Latte Vainilla' AND m.name IN ('Leche Almendra', 'Leche Deslactosada', 'Sin Azúcar', 'Vainilla Extra'))
  OR (pr.name = 'V60 Etiopía Yirgacheffe' AND m.name IN ('Hielo Extra', 'Taza Precalentada'))
  OR (pr.name = 'V60 Colombia Huila' AND m.name IN ('Hielo Extra', 'Taza Precalentada'))
  OR (pr.name = 'Chemex Geisha Panamá' AND m.name IN ('Taza Precalentada'))
  OR (pr.name = 'Iced Latte' AND m.name IN ('Leche Almendra', 'Leche Deslactosada', 'Sin Azúcar', 'Hielo Extra'))
  OR (pr.name = 'Frappé Mocha' AND m.name IN ('Sin Azúcar', 'Crema Extra'))
  OR (pr.name = 'Avocado Toast' AND m.name IN ('Sin Cebolla', 'Huevo Extra'))
  OR (pr.name = 'Tostada Francesa' AND m.name IN ('Sin Azúcar', 'Miel Extra'));

-- ============================================
-- MESAS
-- ============================================
INSERT INTO tables (number, name, status, capacity) VALUES
  (1, 'Mesa 1', 'available', 4),
  (2, 'Mesa 2', 'available', 4),
  (3, 'Mesa 3', 'available', 2),
  (4, 'Mesa 4', 'available', 6),
  (5, 'Mesa 5', 'available', 4),
  (6, 'Mesa Terraza', 'available', 8);
