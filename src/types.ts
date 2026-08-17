export type Role = 'admin' | 'cajero' | 'mesero' | 'kds';

export type CategoryKey =
  | 'espresso'
  | 'filtrados'
  | 'frias'
  | 'pasteleria'
  | 'lacteos'
  | 'descartables'
  | 'extras';

export interface CategoryItem {
  id: string;
  key: CategoryKey;
  name: string;
  emoji: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: CategoryKey;
  stock: number;
  available: boolean;
  modifiers?: string[];
  availableExtras?: string[];
  variants?: ProductVariant[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  modifiers: string[];
  extras: OrderItemExtra[];
  note?: string;
  done?: boolean;
}

export interface OrderItemExtra {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export type OrderDestination =
  | { type: 'mesa'; tableId: string }
  | { type: 'barra' }
  | { type: 'llevar' };

export type OrderStatus = 'nuevo' | 'preparacion' | 'listo' | 'despachado';

export type PaymentMethod = 'qr' | 'tarjeta' | 'efectivo';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Order {
  id: string;
  ticket: string;
  destination: OrderDestination;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  subtotal: number;
  discount: number;
  total: number;
  paid?: boolean;
  paymentMethod?: PaymentMethod;
  payments?: PaymentSplit[];
}

export interface Transaction {
  id: string;
  ticket: string;
  label: string;
  total: number;
  method: PaymentMethod;
  time: number;
}

export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  available: boolean;
  status?: 'available' | 'occupied';
}
