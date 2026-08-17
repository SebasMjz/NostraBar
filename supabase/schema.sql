-- ============================================
-- NOSTRABAR - Schema para Supabase
-- Cafeteria de Especialidad
-- ============================================

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Categorias de productos
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Productos principales (sin stock numerico)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  station TEXT NOT NULL CHECK (station IN ('barra', 'cocina')),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Variantes de productos (tamano + precio)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Ej: "Pequeno", "Mediano", "Grande"
  price INTEGER NOT NULL CHECK (price >= 0),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, name)
);

-- Modificadores (leche almendra, sin azucar, etc.)
CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- "leche", "endulzante", "extra"
  price_modifier INTEGER DEFAULT 0, -- costo adicional
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relacion producto-modificador
CREATE TABLE product_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  UNIQUE(product_id, modifier_id)
);

-- Mesas (CRUD dinamico desde Admin)
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL UNIQUE,
  name TEXT, -- nombre opcional (ej: "Terraza 1")
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  capacity INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket TEXT NOT NULL UNIQUE,
  table_id UUID REFERENCES tables(id), -- nullable para barra/llevar
  destination_type TEXT NOT NULL CHECK (destination_type IN ('mesa', 'barra', 'llevar')),
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'preparacion', 'listo', 'despachado')),
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Items del pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  name TEXT NOT NULL, -- nombre del producto al momento de la venta
  variant_name TEXT, -- nombre de la variante
  price INTEGER NOT NULL, -- precio al momento de la venta
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  modifiers JSONB DEFAULT '[]', -- array de strings
  note TEXT,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('qr', 'tarjeta', 'efectivo')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CAJA
-- ============================================

-- Arqueo de caja
CREATE TABLE cash_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  initial_amount INTEGER NOT NULL DEFAULT 0,
  final_amount INTEGER,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes TEXT
);

-- Movimientos de caja
CREATE TABLE cash_register_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id UUID NOT NULL REFERENCES cash_register(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'refund', 'adjustment', 'initial')),
  amount INTEGER NOT NULL,
  method TEXT CHECK (method IN ('qr', 'tarjeta', 'efectivo')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDICES para performance
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_station ON products(station);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_cash_register_status ON cash_register(status);
CREATE INDEX idx_cash_register_movements_register ON cash_register_movements(cash_register_id);

-- ============================================
-- HABILITAR REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- ============================================
-- ROW LEVEL SECURITY (habilitar despues)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_register_movements ENABLE ROW LEVEL SECURITY;

-- Politicas basicas (permitir todo por ahora, sin auth)
CREATE POLICY "Allow all" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true);
CREATE POLICY "Allow all" ON product_variants FOR ALL USING (true);
CREATE POLICY "Allow all" ON modifiers FOR ALL USING (true);
CREATE POLICY "Allow all" ON product_modifiers FOR ALL USING (true);
CREATE POLICY "Allow all" ON tables FOR ALL USING (true);
CREATE POLICY "Allow all" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all" ON cash_register FOR ALL USING (true);
CREATE POLICY "Allow all" ON cash_register_movements FOR ALL USING (true);
