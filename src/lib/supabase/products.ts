import { supabase } from './client';
import type {
  Product,
  ProductWithVariants,
  ProductInsert,
} from '../../types/database';

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
