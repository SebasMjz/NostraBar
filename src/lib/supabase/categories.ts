import { supabase } from './client';
import type { Category, CategoryInsert } from '../../types/database';

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
