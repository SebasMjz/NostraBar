import { createClient } from '@supabase/supabase-js';
import type {
  Category,
  Product,
  ProductVariant,
  Modifier,
  RestaurantTable,
  Order,
  OrderItem,
  Payment,
  CashRegister,
  CashRegisterMovement,
  ProductWithVariants,
  OrderWithItems,
  CashRegisterWithMovements,
  CategoryInsert,
  ProductInsert,
  ProductVariantInsert,
  ModifierInsert,
  RestaurantTableInsert,
  OrderInsert,
  OrderItemInsert,
  PaymentInsert,
  CashRegisterInsert,
  CashRegisterMovementInsert,
  OrderUpdate,
  RestaurantTableUpdate,
} from '../types/database';

// Configuracion de Supabase
// IMPORTANTE: Reemplaza estas variables con tus valores reales de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'TU-PUBLISHABLE-KEY';

// Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// CATEGORIES
// ============================================
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data || []) as Category[];
  },

  async create(category: CategoryInsert): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category as any)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },
};

// ============================================
// PRODUCTS
// ============================================
export const productsService = {
  async getAll(): Promise<ProductWithVariants[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*)
      `)
      .order('name');
    if (error) throw error;
    return (data || []) as ProductWithVariants[];
  },

  async getByCategory(categoryId: string): Promise<ProductWithVariants[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq('category_id', categoryId)
      .order('name');
    if (error) throw error;
    return (data || []) as ProductWithVariants[];
  },

  async getAvailable(): Promise<ProductWithVariants[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*)
      `)
      .eq('available', true)
      .order('name');
    if (error) throw error;
    return (data || []) as ProductWithVariants[];
  },

  async create(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product as any)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async update(id: string, updates: Partial<ProductInsert>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async toggleAvailable(id: string, available: boolean): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ available } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },
};

// ============================================
// PRODUCT VARIANTS
// ============================================
export const variantsService = {
  async getByProduct(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('price');
    if (error) throw error;
    return (data || []) as ProductVariant[];
  },

  async create(variant: ProductVariantInsert): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variant as any)
      .select()
      .single();
    if (error) throw error;
    return data as ProductVariant;
  },

  async update(id: string, updates: Partial<ProductVariantInsert>): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProductVariant;
  },

  async toggleAvailable(id: string, available: boolean): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ available } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as ProductVariant;
  },
};

// ============================================
// MODIFIERS
// ============================================
export const modifiersService = {
  async getAll(): Promise<Modifier[]> {
    const { data, error } = await supabase
      .from('modifiers')
      .select('*')
      .eq('available', true)
      .order('name');
    if (error) throw error;
    return (data || []) as Modifier[];
  },

  async getByProduct(productId: string): Promise<Modifier[]> {
    const { data, error } = await supabase
      .from('product_modifiers')
      .select('modifier:modifiers(*)')
      .eq('product_id', productId);
    if (error) throw error;
    return ((data || []) as any[]).map((pm) => pm.modifier as Modifier);
  },

  async getAllByProducts(): Promise<Record<string, Modifier[]>> {
    const { data, error } = await supabase
      .from('product_modifiers')
      .select('product_id, modifier:modifiers(*)');
    if (error) throw error;
    const map: Record<string, Modifier[]> = {};
    for (const row of (data || []) as any[]) {
      if (!map[row.product_id]) map[row.product_id] = [];
      map[row.product_id].push(row.modifier as Modifier);
    }
    return map;
  },

  async create(modifier: ModifierInsert): Promise<Modifier> {
    const { data, error } = await supabase
      .from('modifiers')
      .insert(modifier as any)
      .select()
      .single();
    if (error) throw error;
    return data as Modifier;
  },
};

// ============================================
// TABLES
// ============================================
export const tablesService = {
  async getAll(): Promise<RestaurantTable[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('number');
    if (error) throw error;
    return (data || []) as RestaurantTable[];
  },

  async getAvailable(): Promise<RestaurantTable[]> {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('status', 'available')
      .order('number');
    if (error) throw error;
    return (data || []) as RestaurantTable[];
  },

  async create(table: RestaurantTableInsert): Promise<RestaurantTable> {
    const { data, error } = await supabase
      .from('tables')
      .insert(table as any)
      .select()
      .single();
    if (error) throw error;
    return data as RestaurantTable;
  },

  async update(id: string, updates: RestaurantTableUpdate): Promise<RestaurantTable> {
    const { data, error } = await supabase
      .from('tables')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as RestaurantTable;
  },

  async updateStatus(id: string, status: 'available' | 'occupied' | 'reserved'): Promise<RestaurantTable> {
    const { data, error } = await supabase
      .from('tables')
      .update({ status } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as RestaurantTable;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// ORDERS
// ============================================
export const ordersService = {
  async getAll(): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        table:tables(*),
        payments(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as OrderWithItems[];
  },

  async getActive(): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        table:tables(*)
      `)
      .is('closed_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as OrderWithItems[];
  },

  async getByTable(tableId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('table_id', tableId)
      .is('closed_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as OrderWithItems[];
  },

  async getById(id: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        table:tables(*),
        payments(*)
      `)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as OrderWithItems | null;
  },

  async create(order: OrderInsert): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order as any)
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async update(id: string, updates: OrderUpdate): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Order;
  },

  async advanceStatus(id: string): Promise<Order> {
    const order = await this.getById(id);
    if (!order) throw new Error('Order not found');

    const nextStatus: Record<string, Order['status']> = {
      nuevo: 'preparacion',
      preparacion: 'listo',
      listo: 'despachado',
    };

    const newStatus = nextStatus[order.status] || order.status;
    return this.update(id, { status: newStatus });
  },

  async close(id: string): Promise<Order> {
    return this.update(id, {
      status: 'despachado',
      closed_at: new Date().toISOString(),
    });
  },

  async getMaxTicket(): Promise<number> {
    const { data, error } = await supabase
      .from('orders')
      .select('ticket')
      .order('ticket', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return 1000;
    const match = (data[0] as any).ticket?.match(/T-(\d+)/);
    return match ? parseInt(match[1], 10) : 1000;
  },
};

// ============================================
// ORDER ITEMS
// ============================================
export const orderItemsService = {
  async create(item: OrderItemInsert): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .insert(item as any)
      .select()
      .single();
    if (error) throw error;
    return data as OrderItem;
  },

  async update(id: string, updates: Partial<OrderItemInsert>): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as OrderItem;
  },

  async toggleDone(id: string): Promise<OrderItem | null> {
    const { data: item, error: fetchError } = await supabase
      .from('order_items')
      .select('done')
      .eq('id', id)
      .maybeSingle();
    if (fetchError || !item) return null;

    const { data, error } = await supabase
      .from('order_items')
      .update({ done: !(item as any).done } as any)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as OrderItem | null;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================
// PAYMENTS
// ============================================
export const paymentsService = {
  async create(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment as any)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  },

  async getByOrder(orderId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId);
    if (error) throw error;
    return (data || []) as Payment[];
  },

  async getByDateRange(from: string, to: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', from)
      .lte('created_at', to)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Payment[];
  },
};

// ============================================
// CASH REGISTER
// ============================================
export const cashRegisterService = {
  async getOpen(): Promise<CashRegisterWithMovements | null> {
    const { data, error } = await supabase
      .from('cash_register')
      .select(`
        *,
        movements:cash_register_movements(*)
      `)
      .eq('status', 'open')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as CashRegisterWithMovements | null;
  },

  async open(initialAmount: number = 0): Promise<CashRegister> {
    const { data, error } = await supabase
      .from('cash_register')
      .insert({ initial_amount: initialAmount, status: 'open' } as any)
      .select()
      .single();
    if (error) throw error;

    // Registrar movimiento inicial
    if (initialAmount > 0) {
      await this.addMovement({
        cash_register_id: (data as any).id,
        type: 'initial',
        amount: initialAmount,
        description: 'Fondo inicial de caja',
      });
    }

    return data as CashRegister;
  },

  async close(id: string, finalAmount: number, notes?: string): Promise<CashRegister> {
    const { data, error } = await supabase
      .from('cash_register')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        final_amount: finalAmount,
        notes,
      } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CashRegister;
  },

  async addMovement(movement: CashRegisterMovementInsert): Promise<CashRegisterMovement> {
    const { data, error } = await supabase
      .from('cash_register_movements')
      .insert(movement as any)
      .select()
      .single();
    if (error) throw error;
    return data as CashRegisterMovement;
  },

  async getMovements(cashRegisterId: string): Promise<CashRegisterMovement[]> {
    const { data, error } = await supabase
      .from('cash_register_movements')
      .select('*')
      .eq('cash_register_id', cashRegisterId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as CashRegisterMovement[];
  },

  async getTodaySummary(): Promise<{
    totalSales: number;
    byMethod: { qr: number; tarjeta: number; efectivo: number };
    transactionCount: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('payments')
      .select('amount, method')
      .gte('created_at', today.toISOString());
    if (error) throw error;

    const payments = (data || []) as Payment[];
    return {
      totalSales: payments.reduce((sum, p) => sum + p.amount, 0),
      byMethod: {
        qr: payments.filter((p) => p.method === 'qr').reduce((sum, p) => sum + p.amount, 0),
        tarjeta: payments.filter((p) => p.method === 'tarjeta').reduce((sum, p) => sum + p.amount, 0),
        efectivo: payments.filter((p) => p.method === 'efectivo').reduce((sum, p) => sum + p.amount, 0),
      },
      transactionCount: payments.length,
    };
  },
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================
export const realtimeService = {
  subscribeToOrders(callback: (order: Order) => void) {
    return supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          callback(payload.new as Order);
        }
      )
      .subscribe();
  },

  subscribeToOrderItems(callback: (item: OrderItem) => void) {
    return supabase
      .channel('order-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        (payload) => {
          callback(payload.new as OrderItem);
        }
      )
      .subscribe();
  },

  subscribeToTables(callback: (table: RestaurantTable) => void) {
    return supabase
      .channel('tables-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables' },
        (payload) => {
          callback(payload.new as RestaurantTable);
        }
      )
      .subscribe();
  },

  unsubscribe(subscription: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(subscription);
  },
};
