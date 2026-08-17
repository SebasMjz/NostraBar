-- ============================================
-- NOSTRABAR - Seeder para Supabase
-- Ejecutar DESPUÉS de schema.sql
-- ============================================

-- ============================================
-- CATEGORÍAS
-- ============================================
INSERT INTO categories (id, name, description) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Espresso Bar', 'Bebidas de espresso y derivados'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Filtrados', 'Cafés filtrados V60, Chemex, etc.'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Bebidas Frías', 'Cafés y bebidas frías'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Pastelería', 'Panadería, postres y brunch'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Lácteos', 'Leches y cremas'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Descartables', 'Vasos, tapas, servilletas'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Extras', 'Adicionales con precio');

-- ============================================
-- PRODUCTOS - Espresso Bar
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567801', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Espresso Simple', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567802', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Espresso Doble', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Cortado', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Capuccino', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567805', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Flat White', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Latte Vainilla', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567807', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Ristretto', 'barra', true);

-- Variantes Espresso
INSERT INTO product_variants (product_id, name, price, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Simple', 1800, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Doble', 2100, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Simple', 2400, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Mediano', 2800, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Grande', 3200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Mediano', 3000, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Grande', 3400, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Mediano', 3200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Grande', 3600, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Simple', 2200, true);

-- ============================================
-- PRODUCTOS - Filtrados
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567808', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'V60 Etiopía Yirgacheffe', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567809', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'V60 Colombia Huila', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567810', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Chemex Geisha Panamá', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567811', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Cold Brew Concentrado', 'barra', true);

INSERT INTO product_variants (product_id, name, price, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Taza', 4200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Taza', 4000, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Taza', 5800, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Taza', 3600, true);

-- ============================================
-- PRODUCTOS - Bebidas Frías
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Iced Latte', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567813', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Affogato', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567814', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Frappé Mocha', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567815', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Limonada de Hierbas', 'barra', true);

INSERT INTO product_variants (product_id, name, price, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Mediano', 3400, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Grande', 3800, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567813', 'Mediano', 3900, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567814', 'Mediano', 4200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567814', 'Grande', 4600, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567815', 'Taza', 2800, true);

-- ============================================
-- PRODUCTOS - Pastelería
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567816', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Croissant de Mantequilla', 'cocina', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567817', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Croissant de Almendras', 'cocina', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567818', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Cheesecake Frutos Rojos', 'cocina', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567819', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Brownie de Chocolate 70%', 'cocina', false),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Avocado Toast', 'cocina', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567821', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Bowl de Frutas', 'cocina', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Tostada Francesa', 'cocina', true);

INSERT INTO product_variants (product_id, name, price, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567816', 'Unidad', 2600, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567817', 'Unidad', 3000, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567818', 'Porción', 3800, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567819', 'Unidad', 3200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'Plato', 5200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567821', 'Bowl', 3600, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'Plato', 4800, true);

-- ============================================
-- PRODUCTOS - Lácteos (sin precio, insumos)
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567823', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Leche Entera', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567824', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Leche Deslactosada', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567825', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Leche de Almendra', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567826', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Crema de Leche', 'cocina', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567827', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Aguacate', 'cocina', true);

-- ============================================
-- PRODUCTOS - Descartables (sin precio)
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567828', 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Vaso 8oz', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567829', 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Vaso 12oz', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567830', 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Tapa Negra', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567831', 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Servilletas (paq)', 'cocina', true);

-- ============================================
-- PRODUCTOS - Extras (con precio)
-- ============================================
INSERT INTO products (id, category_id, name, station, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567832', 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Crema Extra', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567833', 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Shot Espresso Extra', 'barra', true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567834', 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Chocolate / Cacao', 'barra', true);

INSERT INTO product_variants (product_id, name, price, available) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567832', 'Porción', 800, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567833', 'Shot', 1200, true),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567834', 'Porción', 600, true);

-- ============================================
-- PERSONALIZACIONES (antes "modifiers")
-- ============================================
INSERT INTO modifiers (id, name, category, price_modifier, available) VALUES
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Leche Almendra', 'leche', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Leche Deslactosada', 'leche', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Sin Azúcar', 'endulzante', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Vainilla Extra', 'sabor', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Cacao Extra', 'sabor', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Hielo Extra', 'preparación', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Taza Precalentada', 'preparación', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Sin Cebolla', 'preparación', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Huevo Extra', 'adicional', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Miel Extra', 'adicional', 0, true),
  ('c1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Crema Extra', 'adicional', 0, true);

-- Relacionar personalizaciones con productos
INSERT INTO product_modifiers (product_id, modifier_id) VALUES
  -- Cortado
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'c1b2c3d4-e5f6-7890-abcd-ef1234567801'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'c1b2c3d4-e5f6-7890-abcd-ef1234567802'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'c1b2c3d4-e5f6-7890-abcd-ef1234567803'),
  -- Capuccino
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'c1b2c3d4-e5f6-7890-abcd-ef1234567801'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'c1b2c3d4-e5f6-7890-abcd-ef1234567802'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'c1b2c3d4-e5f6-7890-abcd-ef1234567803'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567804', 'c1b2c3d4-e5f6-7890-abcd-ef1234567805'),
  -- Flat White
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567805', 'c1b2c3d4-e5f6-7890-abcd-ef1234567801'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567805', 'c1b2c3d4-e5f6-7890-abcd-ef1234567802'),
  -- Latte Vainilla
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'c1b2c3d4-e5f6-7890-abcd-ef1234567801'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'c1b2c3d4-e5f6-7890-abcd-ef1234567802'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'c1b2c3d4-e5f6-7890-abcd-ef1234567803'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567806', 'c1b2c3d4-e5f6-7890-abcd-ef1234567804'),
  -- V60
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567808', 'c1b2c3d4-e5f6-7890-abcd-ef1234567806'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567808', 'c1b2c3d4-e5f6-7890-abcd-ef1234567807'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567809', 'c1b2c3d4-e5f6-7890-abcd-ef1234567806'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567809', 'c1b2c3d4-e5f6-7890-abcd-ef1234567807'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567810', 'c1b2c3d4-e5f6-7890-abcd-ef1234567807'),
  -- Iced Latte
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'c1b2c3d4-e5f6-7890-abcd-ef1234567801'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'c1b2c3d4-e5f6-7890-abcd-ef1234567802'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'c1b2c3d4-e5f6-7890-abcd-ef1234567803'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567812', 'c1b2c3d4-e5f6-7890-abcd-ef1234567806'),
  -- Frappé
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567814', 'c1b2c3d4-e5f6-7890-abcd-ef1234567803'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567814', 'c1b2c3d4-e5f6-7890-abcd-ef1234567811'),
  -- Avocado Toast
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'c1b2c3d4-e5f6-7890-abcd-ef1234567808'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567820', 'c1b2c3d4-e5f6-7890-abcd-ef1234567809'),
  -- Tostada Francesa
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'c1b2c3d4-e5f6-7890-abcd-ef1234567803'),
  ('b1b2c3d4-e5f6-7890-abcd-ef1234567822', 'c1b2c3d4-e5f6-7890-abcd-ef1234567810');

-- ============================================
-- MESAS
-- ============================================
INSERT INTO tables (id, number, name, status, capacity) VALUES
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567801', 1, 'Mesa 1', 'available', 4),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567802', 2, 'Mesa 2', 'available', 4),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567803', 3, 'Mesa 3', 'available', 2),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567804', 4, 'Mesa 4', 'available', 6),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567805', 5, 'Mesa 5', 'available', 4),
  ('d1b2c3d4-e5f6-7890-abcd-ef1234567806', 6, 'Mesa Terraza', 'available', 8);
