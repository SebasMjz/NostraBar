import { supabase } from './client';
import type { OrderItem, OrderItemInsert } from '../../types/database';

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
