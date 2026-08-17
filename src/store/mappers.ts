import type { CategoryItem, CategoryKey, Order, OrderDestination, OrderItem, Product, Table } from '@/types';
import type { Category, Product as DbProduct, ProductVariant as DbVariant, RestaurantTable as DbTable, Order as DbOrder, OrderItem as DbOrderItem } from '@/types/database';

const categoryKeyFromName = (name: string): CategoryKey => {
  const map: Record<string, CategoryKey> = {
    'espresso bar': 'espresso',
    'filtrados': 'filtrados',
    'bebidas frías': 'frias',
    'bebidas frias': 'frias',
    'pastelería': 'pasteleria',
    'pasteleria': 'pasteleria',
    'lácteos': 'lacteos',
    'lacteos': 'lacteos',
    'descartables': 'descartables',
    'extras': 'extras',
  };
  return map[name.toLowerCase()] || name.toLowerCase().replace(/\s+/g, '_').slice(0, 15) as CategoryKey;
};

const emojiMap: Record<string, string> = {
  'espresso bar': '☕',
  'filtrados': '🫖',
  'bebidas frías': '🧊',
  'pastelería': '🥐',
  'lácteos': '🥛',
  'descartables': '📦',
  'extras': '✨',
};

export const mapCategory = (c: Category): CategoryItem => ({
  id: c.id,
  key: categoryKeyFromName(c.name),
  name: c.name,
  emoji: emojiMap[c.name.toLowerCase()] || '📦',
});

export const mapProduct = (p: DbProduct & { variants?: DbVariant[]; category?: Category }, catMap: Record<string, CategoryItem>): Product => {
  const cat = catMap[p.category_id];
  const variants = (p.variants || []).map((v) => ({ name: v.name, price: v.price, available: v.available }));
  const price = variants.length > 0 ? variants[0].price : 0;
  return {
    id: p.id,
    name: p.name,
    price,
    category: cat?.key || 'extras',
    stock: 100,
    available: p.available,
    variants,
    modifiers: [],
    availableExtras: [],
  };
};

export const mapTable = (t: DbTable): Table => ({
  id: t.id,
  number: t.number,
  name: t.name || `Mesa ${t.number}`,
  capacity: t.capacity,
  available: t.status === 'available',
});

export const mapOrder = (o: DbOrder & { items?: DbOrderItem[] }): Order => {
  const items: OrderItem[] = (o.items || []).map((i) => ({
    id: i.id,
    productId: i.product_id,
    name: i.name,
    price: i.price,
    qty: i.quantity,
    modifiers: Array.isArray(i.modifiers) ? (i.modifiers as string[]) : [],
    extras: [],
    note: i.note || undefined,
    done: i.done,
  }));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  let destination: OrderDestination;
  if (o.destination_type === 'mesa' && o.table_id) {
    destination = { type: 'mesa', tableId: o.table_id };
  } else if (o.destination_type === 'barra') {
    destination = { type: 'barra' };
  } else {
    destination = { type: 'llevar' };
  }

  return {
    id: o.id,
    ticket: o.ticket,
    destination,
    items,
    status: o.status as Order['status'],
    createdAt: new Date(o.created_at).getTime(),
    subtotal,
    discount: o.discount,
    total: o.total,
    paid: !!o.closed_at,
  };
};

export const uid = () => crypto.randomUUID();

let ticketSeq = 1000;
export const setTicketSeq = (n: number) => { ticketSeq = n; };
export const getTicketSeq = () => ticketSeq;
export const newTicket = () => `T-${ticketSeq++}`;
