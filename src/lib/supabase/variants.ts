import { supabase } from './client';
import type { ProductVariant, ProductVariantInsert } from '../../types/database';

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
