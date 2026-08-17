import { supabase } from './client';
import type { Payment, PaymentInsert } from '../../types/database';

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
