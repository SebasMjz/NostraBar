import { supabase } from './client';
import type {
  Payment,
  CashRegister,
  CashRegisterWithMovements,
  CashRegisterMovementInsert,
  CashRegisterMovement,
} from '../../types/database';

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
