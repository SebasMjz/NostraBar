import { supabase } from './client';
import type { Modifier, ModifierInsert } from '../../types/database';

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
