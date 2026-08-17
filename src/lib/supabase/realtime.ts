import { supabase } from './client';
import type { Order, OrderItem, RestaurantTable } from '../../types/database';

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
