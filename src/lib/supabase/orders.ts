import { supabase } from './client';
import type {
  Order,
  OrderWithItems,
  OrderInsert,
  OrderUpdate,
} from '../../types/database';

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
