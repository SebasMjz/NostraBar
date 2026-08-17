import { supabase } from './client';
import type {
  RestaurantTable,
  RestaurantTableInsert,
  RestaurantTableUpdate,
} from '../../types/database';

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
