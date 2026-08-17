// Tipos generados desde el schema de Supabase
// NostraBar - Cafeteria de Especialidad

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================
// DATABASE SCHEMA (para createClient de Supabase)
// ============================================

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: Partial<CategoryInsert>;
        Relationships: GenericRelationship[];
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: GenericRelationship[];
      };
      product_variants: {
        Row: ProductVariant;
        Insert: ProductVariantInsert;
        Update: Partial<ProductVariantInsert>;
        Relationships: GenericRelationship[];
      };
      modifiers: {
        Row: Modifier;
        Insert: ModifierInsert;
        Update: Partial<ModifierInsert>;
        Relationships: GenericRelationship[];
      };
      product_modifiers: {
        Row: ProductModifier;
        Insert: { product_id: string; modifier_id: string };
        Update: Partial<{ product_id: string; modifier_id: string }>;
        Relationships: GenericRelationship[];
      };
      tables: {
        Row: RestaurantTable;
        Insert: RestaurantTableInsert;
        Update: Partial<RestaurantTableInsert>;
        Relationships: GenericRelationship[];
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
        Relationships: GenericRelationship[];
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
        Relationships: GenericRelationship[];
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: Partial<PaymentInsert>;
        Relationships: GenericRelationship[];
      };
      cash_register: {
        Row: CashRegister;
        Insert: CashRegisterInsert;
        Update: Partial<CashRegisterInsert>;
        Relationships: GenericRelationship[];
      };
      cash_register_movements: {
        Row: CashRegisterMovement;
        Insert: CashRegisterMovementInsert;
        Update: Partial<CashRegisterMovementInsert>;
        Relationships: GenericRelationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// ============================================
// TYPES POR TABLA
// ============================================

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  station: 'barra' | 'cocina';
  available: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  available: boolean;
  created_at: string;
}

export interface Modifier {
  id: string;
  name: string;
  category: string | null;
  price_modifier: number;
  available: boolean;
  created_at: string;
}

export interface ProductModifier {
  id: string;
  product_id: string;
  modifier_id: string;
}

export interface RestaurantTable {
  id: string;
  number: number;
  name: string | null;
  status: 'available' | 'occupied' | 'reserved';
  capacity: number;
  created_at: string;
}

export interface Order {
  id: string;
  ticket: string;
  table_id: string | null;
  destination_type: 'mesa' | 'barra' | 'llevar';
  status: 'nuevo' | 'preparacion' | 'listo' | 'despachado';
  subtotal: number;
  discount: number;
  total: number;
  created_at: string;
  closed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  modifiers: Json;
  note: string | null;
  done: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: 'qr' | 'tarjeta' | 'efectivo';
  amount: number;
  created_at: string;
}

export interface CashRegister {
  id: string;
  opened_at: string;
  closed_at: string | null;
  initial_amount: number;
  final_amount: number | null;
  status: 'open' | 'closed';
  notes: string | null;
}

export interface CashRegisterMovement {
  id: string;
  cash_register_id: string;
  type: 'sale' | 'refund' | 'adjustment' | 'initial';
  amount: number;
  method: 'qr' | 'tarjeta' | 'efectivo' | null;
  description: string | null;
  created_at: string;
}

// ============================================
// TYPES CON RELACIONES (JOIN)
// ============================================

export interface ProductWithVariants extends Product {
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductWithModifiers extends Product {
  modifiers?: Modifier[];
}

export interface OrderWithItems extends Order {
  items?: OrderItem[];
  table?: RestaurantTable;
  payments?: Payment[];
}

export interface CashRegisterWithMovements extends CashRegister {
  movements?: CashRegisterMovement[];
}

// ============================================
// TYPES PARA INSERCION (sin id y created_at)
// ============================================

export interface CategoryInsert {
  name: string;
  description?: string | null;
}

export interface ProductInsert {
  category_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  station: 'barra' | 'cocina';
  available?: boolean;
}

export interface ProductVariantInsert {
  product_id: string;
  name: string;
  price: number;
  available?: boolean;
}

export interface ModifierInsert {
  name: string;
  category?: string | null;
  price_modifier?: number;
  available?: boolean;
}

export interface RestaurantTableInsert {
  number: number;
  name?: string | null;
  status?: 'available' | 'occupied' | 'reserved';
  capacity?: number;
}

export interface OrderInsert {
  ticket: string;
  table_id?: string | null;
  destination_type: 'mesa' | 'barra' | 'llevar';
  status?: 'nuevo' | 'preparacion' | 'listo' | 'despachado';
  subtotal?: number;
  discount?: number;
  total?: number;
  closed_at?: string | null;
}

export interface OrderItemInsert {
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  name: string;
  variant_name?: string | null;
  price: number;
  quantity?: number;
  modifiers?: Json;
  note?: string | null;
  done?: boolean;
}

export interface PaymentInsert {
  order_id: string;
  method: 'qr' | 'tarjeta' | 'efectivo';
  amount: number;
}

export interface CashRegisterInsert {
  opened_at?: string;
  closed_at?: string | null;
  initial_amount?: number;
  final_amount?: number | null;
  status?: 'open' | 'closed';
  notes?: string | null;
}

export interface CashRegisterMovementInsert {
  cash_register_id: string;
  type: 'sale' | 'refund' | 'adjustment' | 'initial';
  amount: number;
  method?: 'qr' | 'tarjeta' | 'efectivo' | null;
  description?: string | null;
}

// ============================================
// TYPES PARA UPDATE (todos opcionales)
// ============================================

export type CategoryUpdate = Partial<CategoryInsert>;
export type ProductUpdate = Partial<ProductInsert>;
export type ProductVariantUpdate = Partial<ProductVariantInsert>;
export type ModifierUpdate = Partial<ModifierInsert>;
export type RestaurantTableUpdate = Partial<RestaurantTableInsert>;
export type OrderUpdate = Partial<OrderInsert>;
export type OrderItemUpdate = Partial<OrderItemInsert>;
export type PaymentUpdate = Partial<PaymentInsert>;
export type CashRegisterUpdate = Partial<CashRegisterInsert>;
export type CashRegisterMovementUpdate = Partial<CashRegisterMovementInsert>;
