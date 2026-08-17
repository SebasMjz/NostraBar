import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CategoryItem, CategoryKey, Order, OrderDestination, OrderItem, OrderItemExtra, PaymentMethod, PaymentSplit, Product, Role, Table, Transaction } from '@/types';
import {
  categoriesService,
  productsService,
  variantsService,
  modifiersService,
  tablesService,
  ordersService,
  orderItemsService,
  paymentsService,
  cashRegisterService,
  realtimeService,
  supabase,
} from '@/lib/supabase';
import type { Category, Product as DbProduct, ProductVariant as DbVariant, Modifier as DbModifier, RestaurantTable as DbTable, Order as DbOrder, OrderItem as DbOrderItem } from '@/types/database';

interface StoreValue {
  role: Role;
  setRole: (r: Role) => void;

  categories: CategoryItem[];
  addCategory: (cat: Omit<CategoryItem, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  removeCategory: (id: string) => void;

  products: Product[];
  toggleAvailable: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;

  tables: Table[];
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;

  orders: Order[];
  transactions: Transaction[];

  // POS comanda activa
  activeItems: OrderItem[];
  activeDestination: OrderDestination;
  setActiveDestination: (d: OrderDestination) => void;
  addToComanda: (p: Product, modifiers?: string[], extras?: OrderItemExtra[]) => void;
  removeExtraFromItem: (itemId: string, extraId: string) => void;
  changeQty: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  setItemNote: (itemId: string, note: string) => void;
  clearComanda: () => void;
  discount: number;
  setDiscount: (n: number) => void;

  // Pedidos
  sendToKitchen: () => Promise<void>;
  addItemToOrder: (orderId: string, p: Product, modifiers?: string[], extras?: OrderItemExtra[]) => void;
  getOrderForTable: (tableId: string) => Order | undefined;
  payOrder: (orderId: string, payments: PaymentSplit[]) => Promise<void>;
  transferTable: (fromTableId: string, toTableId: string) => Promise<void>;

  // KDS
  advanceOrder: (id: string) => void;
  toggleItemDone: (orderId: string, itemId: string) => void;

  // Print
  printReceipt: (orderId: string) => void;

  // Cash register
  activeCashRegister: any | null;
  openCashRegister: (initialAmount: number) => Promise<void>;
  closeCashRegister: (finalAmount: number, notes?: string) => Promise<void>;

  // Ready alerts for mesero
  readyAlerts: string[];
  dismissReadyAlert: (tableId: string) => void;

  loading: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

let ticketSeq = 1000;
const newTicket = () => `T-${ticketSeq++}`;
const uid = () => crypto.randomUUID();

// ============================================
// Conversion functions: Supabase → App types
// ============================================
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

const mapCategory = (c: Category): CategoryItem => ({
  id: c.id,
  key: categoryKeyFromName(c.name),
  name: c.name,
  emoji: emojiMap[c.name.toLowerCase()] || '📦',
});

const mapProduct = (p: DbProduct & { variants?: DbVariant[]; category?: Category }, catMap: Record<string, CategoryItem>): Product => {
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

const mapTable = (t: DbTable): Table => ({
  id: t.id,
  number: t.number,
  name: t.name || `Mesa ${t.number}`,
  capacity: t.capacity,
  available: t.status === 'available',
});

const mapOrder = (o: DbOrder & { items?: DbOrderItem[] }): Order => {
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [readyAlerts, setReadyAlerts] = useState<string[]>([]);
  const [activeCashRegister, setActiveCashRegister] = useState<any | null>(null);

  const [activeItems, setActiveItems] = useState<OrderItem[]>([]);
  const [activeDestination, setActiveDestination] = useState<OrderDestination>({ type: 'mesa', tableId: '' });
  const [discount, setDiscount] = useState(0);

  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  // ============================================
  // Load data from Supabase on mount (batch optimized)
  // ============================================
  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      try {
        // 1. Load categories
        const dbCategories = await categoriesService.getAll();
        const catMap: Record<string, CategoryItem> = {};
        const mappedCategories = dbCategories.map((c) => {
          const mapped = mapCategory(c);
          catMap[c.id] = mapped;
          return mapped;
        });

        // 2. Load products with variants
        const dbProducts = await productsService.getAll();
        const mappedProducts = dbProducts.map((p) => mapProduct(p as any, catMap));

        // 3. Load ALL modifiers in ONE query (batch, not N+1)
        const modsByProduct = await modifiersService.getAllByProducts();
        for (const p of mappedProducts) {
          const mods = modsByProduct[p.id];
          if (mods) p.modifiers = mods.map((m) => m.name);
        }

        // 4. Load extras configuration (persisted in localStorage)
        const storedExtras = localStorage.getItem('nostrabar_product_extras');
        const extrasConfig: Record<string, string[]> = storedExtras ? JSON.parse(storedExtras) : {};
        const extrasCat = mappedCategories.find((c) => c.key === 'extras');
        const defaultExtraIds = extrasCat
          ? mappedProducts.filter((p) => p.category === 'extras').map((e) => e.id)
          : [];

        for (const p of mappedProducts) {
          if (extrasConfig[p.id] !== undefined) {
            p.availableExtras = extrasConfig[p.id];
          } else {
            const isBeverage = p.category === 'espresso' || p.category === 'filtrados' || p.category === 'frias';
            p.availableExtras = isBeverage ? defaultExtraIds : [];
          }
        }

        // 5. Load tables
        const dbTables = await tablesService.getAll();
        const mappedTables = dbTables.map(mapTable);

        // 6. Load active orders
        const dbOrders = await ordersService.getActive();
        const mappedOrders = dbOrders.map(mapOrder);

        // 7. Get max ticket from Supabase
        const maxTicket = await ordersService.getMaxTicket();

        // 8. Check open cash register
        const openReg = await cashRegisterService.getOpen().catch(() => null);

        // Set first table as default destination
        const firstTableId = mappedTables.length > 0 ? mappedTables[0].id : '';

        if (mounted) {
          setCategories(mappedCategories);
          setProducts(mappedProducts);
          setTables(mappedTables);
          setOrders(mappedOrders);
          setActiveDestination({ type: 'mesa', tableId: firstTableId });
          ticketSeq = maxTicket + 1;
          setActiveCashRegister(openReg);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  // ============================================
  // Realtime subscriptions
  // ============================================
  useEffect(() => {
    const orderSub = realtimeService.subscribeToOrders((payload) => {
      const newOrder = payload as any;
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === newOrder.id);
        if (newOrder.closed_at) {
          return prev.filter((o) => o.id !== newOrder.id);
        }
        if (exists) {
          return prev.map((o) => {
            if (o.id !== newOrder.id) return o;
            return { ...o, status: newOrder.status, total: newOrder.total, discount: newOrder.discount };
          });
        }
        return prev;
      });
    });

    const itemSub = realtimeService.subscribeToOrderItems((payload) => {
      const item = payload as any;
      setOrders((prev) => prev.map((o) => {
        if (o.id !== item.order_id) return o;
        const existing = o.items.find((i) => i.id === item.id);
        if (existing) {
          return { ...o, items: o.items.map((i) => i.id === item.id ? { ...i, done: item.done, price: item.price, quantity: item.quantity } : i) };
        }
        return o;
      }));
    });

    const tableSub = realtimeService.subscribeToTables((payload) => {
      const tbl = payload as any;
      setTables((prev) => prev.map((t) => t.id === tbl.id ? { ...t, status: tbl.status, number: tbl.number, name: tbl.name, capacity: tbl.capacity } : t));
    });

    return () => {
      realtimeService.unsubscribe(orderSub);
      realtimeService.unsubscribe(itemSub);
      realtimeService.unsubscribe(tableSub);
    };
  }, []);

  // ============================================
  // Categories CRUD
  // ============================================
  const addCategory = useCallback(async (cat: Omit<CategoryItem, 'id'>) => {
    try {
      const created = await categoriesService.create({ name: cat.name });
      const newCat: CategoryItem = { id: created.id, key: cat.key, name: cat.name, emoji: cat.emoji };
      setCategories((prev) => [...prev, newCat]);
    } catch (err) {
      console.error('Error creating category:', err);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<CategoryItem>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ============================================
  // Products CRUD
  // ============================================
  const toggleAvailable = useCallback(async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newAvailable = !product.available;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: newAvailable } : p)));
    try { await productsService.toggleAvailable(id, newAvailable); } catch (err) { console.error(err); }
  }, [products]);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    // For now, add locally. Full Supabase integration requires category UUID mapping.
    setProducts((prev) => [...prev, { ...product, id: uid() }]);
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      if (updates.availableExtras !== undefined) {
        try {
          const storedExtras = localStorage.getItem('nostrabar_product_extras');
          const extrasConfig: Record<string, string[]> = storedExtras ? JSON.parse(storedExtras) : {};
          extrasConfig[id] = updates.availableExtras;
          localStorage.setItem('nostrabar_product_extras', JSON.stringify(extrasConfig));
        } catch (e) {
          console.error('Error saving extras config:', e);
        }
      }
      return updated;
    });
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ============================================
  // Tables CRUD
  // ============================================
  const addTable = useCallback(async (table: Omit<Table, 'id'>) => {
    try {
      const created = await tablesService.create({ number: table.number, name: table.name, capacity: table.capacity, status: 'available' });
      const newTable: Table = { id: created.id, number: table.number, name: table.name, capacity: table.capacity, available: true };
      setTables((prev) => [...prev, newTable]);
    } catch (err) {
      console.error('Error creating table:', err);
    }
  }, []);

  const updateTable = useCallback(async (id: string, updates: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const removeTable = useCallback(async (id: string) => {
    try {
      await tablesService.remove(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error removing table:', err);
    }
  }, []);

  // ============================================
  // Orders
  // ============================================
  const getOrderForTable = useCallback((tableId: string) => {
    return orders.find((o) => o.destination.type === 'mesa' && o.destination.tableId === tableId && !o.paid);
  }, [orders]);

  // POS - Add to comanda (local state)
  const addToComanda = useCallback((p: Product, modifiers: string[] = [], extras: OrderItemExtra[] = []) => {
    if (!p.available) return;
    setActiveItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === p.id &&
          JSON.stringify(i.modifiers) === JSON.stringify(modifiers) &&
          JSON.stringify(i.extras) === JSON.stringify(extras),
      );
      if (existing) return prev.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: uid(), productId: p.id, name: p.name, price: p.price, qty: 1, modifiers, extras, note: '' }];
    });
  }, []);

  const removeExtraFromItem = useCallback((itemId: string, extraId: string) => {
    setActiveItems((prev) => prev.map((i) => {
      if (i.id !== itemId) return i;
      return { ...i, extras: i.extras.filter((e) => e.id !== extraId) };
    }));
  }, []);

  const changeQty = useCallback((itemId: string, delta: number) => {
    setActiveItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setActiveItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const setItemNote = useCallback((itemId: string, note: string) => {
    setActiveItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, note } : i)));
  }, []);

  const clearComanda = useCallback(() => {
    setActiveItems([]);
    setDiscount(0);
  }, []);

  const subtotal = useMemo(() => {
    return activeItems.reduce((s, i) => {
      const extrasTotal = i.extras.reduce((es, e) => es + e.price * e.qty, 0);
      return s + (i.price + extrasTotal) * i.qty;
    }, 0);
  }, [activeItems]);
  const total = Math.max(0, subtotal - discount);

  // Send to kitchen (new order)
  const sendToKitchen = useCallback(async () => {
    if (activeItems.length === 0) return;

    const existingOrder = activeDestination.type === 'mesa'
      ? ordersRef.current.find((o) => o.destination.type === 'mesa' && o.destination.tableId === activeDestination.tableId && !o.paid)
      : activeDestination.type === 'barra'
        ? ordersRef.current.find((o) => o.destination.type === 'barra' && !o.paid)
        : activeDestination.type === 'llevar'
          ? ordersRef.current.find((o) => o.destination.type === 'llevar' && !o.paid)
          : null;

    if (existingOrder) {
      // Add items to existing order — only persist if order has a real Supabase ID
      const newItems = activeItems.map((i) => ({ ...i, id: uid(), done: false }));
      const newStatus = (existingOrder.status === 'despachado' || existingOrder.status === 'listo') ? 'nuevo' : existingOrder.status;

      setOrders((prev) => prev.map((o) => {
        if (o.id !== existingOrder.id) return o;
        const updatedItems = [...o.items, ...newItems];
        const newSubtotal = updatedItems.reduce((s, i) => {
          const extrasTotal = i.extras.reduce((es, e) => es + e.price * e.qty, 0);
          return s + (i.price + extrasTotal) * i.qty;
        }, 0);
        const nowTime = Date.now();
        return { ...o, items: updatedItems, subtotal: newSubtotal, total: Math.max(0, newSubtotal - o.discount), status: newStatus, createdAt: nowTime };
      }));

      // Persist to Supabase
      try {
        for (const item of activeItems) {
          await orderItemsService.create({
            order_id: existingOrder.id,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.qty,
            modifiers: item.modifiers,
            note: item.note || null,
            done: false,
          });
        }

        const addedSubtotal = activeItems.reduce((s, i) => {
          const extrasTotal = i.extras.reduce((es, e) => es + e.price * e.qty, 0);
          return s + (i.price + extrasTotal) * i.qty;
        }, 0);
        const updatedSubtotal = existingOrder.subtotal + addedSubtotal;
        const updatedTotal = Math.max(0, updatedSubtotal - existingOrder.discount);

        await ordersService.update(existingOrder.id, {
          status: newStatus,
          subtotal: updatedSubtotal,
          total: updatedTotal,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error adding items to order:', err);
      }
    } else {
      // Create new order — Supabase FIRST, then local state
      const ticket = newTicket();

      try {
        const destType = activeDestination.type;
        const tableId = activeDestination.type === 'mesa' ? activeDestination.tableId : null;
        const created = await ordersService.create({
          ticket,
          destination_type: destType,
          table_id: tableId,
          status: 'nuevo',
          subtotal,
          discount,
          total,
        });

        const realId = (created as any).id;

        // Create order items in Supabase
        for (const item of activeItems) {
          await orderItemsService.create({
            order_id: realId,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.qty,
            modifiers: item.modifiers,
            note: item.note || null,
            done: false,
          });
        }

        // Update table status
        if (activeDestination.type === 'mesa') {
          await tablesService.updateStatus(activeDestination.tableId, 'occupied');
        }

        // NOW add to local state with the real ID
        const order: Order = {
          id: realId,
          ticket,
          destination: activeDestination,
          items: activeItems.map((i) => ({ ...i, done: false })),
          status: 'nuevo',
          createdAt: Date.now(),
          subtotal,
          discount,
          total,
        };
        setOrders((prev) => [...prev, order]);
      } catch (err) {
        console.error('Error creating order in Supabase:', err);
        // Revert ticket counter on failure
        ticketSeq--;
      }
    }
  }, [activeItems, activeDestination, subtotal, discount, clearComanda]);

  // Add items to existing order (from table view)
  const addItemToOrder = useCallback(async (orderId: string, p: Product, modifiers: string[] = [], extras: OrderItemExtra[] = []) => {
    const extrasTotal = extras.reduce((s, e) => s + e.price * e.qty, 0);
    const itemPrice = p.price + extrasTotal;
    const newItem: OrderItem = { id: uid(), productId: p.id, name: p.name, price: p.price, qty: 1, modifiers, extras, done: false };

    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      const updatedItems = [...o.items, newItem];
      const newSubtotal = o.subtotal + itemPrice;
      return { ...o, items: updatedItems, subtotal: newSubtotal, total: Math.max(0, newSubtotal - o.discount) };
    }));

    try {
      await orderItemsService.create({
        order_id: orderId,
        product_id: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        modifiers,
        done: false,
      });
    } catch (err) {
      console.error('Error adding single item to order in Supabase:', err);
    }
  }, []);

  const payOrder = useCallback(async (orderId: string, payments: PaymentSplit[]) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paid: true } : o)));

    const order = orders.find((o) => o.id === orderId);
    if (order?.destination.type === 'mesa') {
      const tId = (order.destination as any).tableId;
      setTables((prev) => prev.map((t) => (t.id === tId ? { ...t, status: 'available' } : t)));
    }

    if (order) {
      const label = destLabel(order.destination, tables);
      const primaryMethod = payments[0]?.method || 'efectivo';
      const tx: Transaction = {
        id: uid(),
        ticket: order.ticket,
        label,
        total: order.total,
        method: primaryMethod,
        time: Date.now(),
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    try {
      await ordersService.close(orderId);
      for (const p of payments) {
        await paymentsService.create({ order_id: orderId, method: p.method, amount: p.amount });
      }
      if (order?.destination.type === 'mesa') {
        await tablesService.updateStatus((order.destination as any).tableId, 'available');
      }
    } catch (err) {
      console.error('Error paying order in Supabase:', err);
    }
  }, [orders, tables]);

  const transferTable = useCallback(async (fromTableId: string, toTableId: string) => {
    const order = ordersRef.current.find((o) => o.destination.type === 'mesa' && (o.destination as any).tableId === fromTableId && !o.paid);
    if (!order) return;

    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, destination: { type: 'mesa', tableId: toTableId } } : o));
    setTables((prev) => prev.map((t) => {
      if (t.id === fromTableId) return { ...t, status: 'available' };
      if (t.id === toTableId) return { ...t, status: 'occupied' };
      return t;
    }));

    try {
      await ordersService.update(order.id, { destination_type: 'mesa', table_id: toTableId } as any);
      await tablesService.updateStatus(fromTableId, 'available');
      await tablesService.updateStatus(toTableId, 'occupied');
    } catch (e) {
      console.error('Error transferring table in Supabase:', e);
    }
  }, []);

  const openCashRegister = useCallback(async (initialAmount: number) => {
    try {
      const reg = await cashRegisterService.open(initialAmount);
      setActiveCashRegister(reg);
    } catch (e) {
      console.error('Error opening cash register:', e);
      setActiveCashRegister({ id: uid(), initial_amount: initialAmount, status: 'open', opened_at: new Date().toISOString() });
    }
  }, []);

  const closeCashRegister = useCallback(async (finalAmount: number, notes?: string) => {
    if (!activeCashRegister) return;
    try {
      await cashRegisterService.close(activeCashRegister.id, finalAmount, notes);
    } catch (e) {
      console.error('Error closing cash register:', e);
    } finally {
      setActiveCashRegister(null);
    }
  }, [activeCashRegister]);

  const advanceOrder = useCallback(async (id: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next = o.status === 'nuevo' ? 'preparacion' : o.status === 'preparacion' ? 'listo' : 'despachado';
      return { ...o, status: next };
    }));

    const order = ordersRef.current.find((o) => o.id === id);
    if (order) {
      const next = order.status === 'nuevo' ? 'preparacion' : order.status === 'preparacion' ? 'listo' : 'despachado';
      if (next === 'listo' && order.destination.type === 'mesa') {
        const tId = (order.destination as any).tableId;
        setReadyAlerts((prev) => [...prev.filter((a) => a !== order.destination.type + tId), order.destination.type + tId]);
      }
    }

    try { await ordersService.advanceStatus(id); } catch (err) { console.error(err); }
  }, []);

  const toggleItemDone = useCallback(async (orderId: string, itemId: string) => {
    setOrders((prev) => prev.map((o) =>
      o.id !== orderId ? o : { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) },
    ));
    try { await orderItemsService.toggleDone(itemId); } catch (err) { console.error(err); }
  }, []);

  // ============================================
  // Print Receipt
  // ============================================
  const printReceipt = useCallback((orderId: string) => {
    const order = ordersRef.current.find((o) => o.id === orderId);
    if (!order) return;

    const label = destLabel(order.destination, tables);
    const itemsHtml = order.items.map((item) => {
      const extrasList = item.extras.map((e) => `  + ${e.name} (${money(e.price)})`).join('<br>');
      const modsList = item.modifiers.length > 0 ? `<br><span style="color:#92400e;font-size:11px">${item.modifiers.join(', ')}</span>` : '';
      const noteHtml = item.note ? `<br><span style="color:#6b7280;font-size:11px">"${item.note}"</span>` : '';
      return `<tr>
        <td style="padding:4px 0;border-bottom:1px dashed #e5e7eb">${item.qty}x ${item.name}${modsList}${noteHtml}${extrasList ? '<br>' + extrasList : ''}</td>
        <td style="padding:4px 0;border-bottom:1px dashed #e5e7eb;text-align:right">${money(item.price * item.qty)}</td>
      </tr>`;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html><head><title>Recibo ${order.ticket}</title>
      <style>
        body{font-family:'Courier New',monospace;font-size:13px;max-width:300px;margin:0 auto;padding:20px}
        h2{text-align:center;margin:0 0 5px;font-size:18px}
        .center{text-align:center}
        .divider{border-top:2px dashed #000;margin:10px 0}
        table{width:100%;border-collapse:collapse}
        td{padding:3px 0}
        .total{font-weight:bold;font-size:15px;border-top:2px solid #000;padding-top:8px;margin-top:8px}
      </style></head><body>
        <div class="center"><h2>NostraBar</h2><p style="margin:0;color:#6b7280">Cafetería de Especialidad</p></div>
        <div class="divider"></div>
        <div class="center" style="margin-bottom:10px">
          <strong style="font-size:16px">${order.ticket}</strong><br>
          <span style="color:#6b7280">${label}</span><br>
          <span style="color:#6b7280;font-size:11px">${new Date(order.createdAt).toLocaleString('es-CO')}</span>
        </div>
        <div class="divider"></div>
        <table>${itemsHtml}</table>
        <div class="divider"></div>
        <div style="display:flex;justify-content:space-between"><span>Subtotal:</span><span>${money(order.subtotal)}</span></div>
        ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:#dc2626"><span>Descuento:</span><span>-${money(order.discount)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between" class="total"><span>TOTAL:</span><span>${money(order.total)}</span></div>
        <div class="divider"></div>
        <div class="center" style="margin-top:15px;color:#6b7280;font-size:11px">¡Gracias por su compra!</div>
      </body></html>`;

    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [tables]);

  const dismissReadyAlert = useCallback((key: string) => {
    setReadyAlerts((prev) => prev.filter((a) => a !== key));
  }, []);

  const value: StoreValue = {
    role, setRole,
    categories, addCategory, updateCategory, removeCategory,
    products, toggleAvailable, addProduct, updateProduct, removeProduct,
    tables, addTable, updateTable, removeTable,
    orders, transactions,
    activeItems, activeDestination, setActiveDestination,
    addToComanda, removeExtraFromItem, changeQty, removeItem, setItemNote, clearComanda,
    discount, setDiscount,
    sendToKitchen, addItemToOrder, getOrderForTable, payOrder, transferTable,
    advanceOrder, toggleItemDone,
    printReceipt,
    activeCashRegister, openCashRegister, closeCashRegister,
    readyAlerts, dismissReadyAlert,
    loading,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export const categoryLabels: Record<CategoryKey, string> = {
  espresso: 'Espresso Bar',
  filtrados: 'Filtrados',
  frias: 'Bebidas Frías',
  pasteleria: 'Pastelería',
  lacteos: 'Lácteos',
  descartables: 'Descartables',
  extras: 'Extras',
};

export const categoryEmojis: Record<CategoryKey, string> = {
  espresso: '☕',
  filtrados: '🫖',
  frias: '🧊',
  pasteleria: '🥐',
  lacteos: '🥛',
  descartables: '📦',
  extras: '✨',
};

export const posCategories: CategoryKey[] = ['espresso', 'filtrados', 'frias', 'pasteleria'];

export function destLabel(d: OrderDestination, tables?: Table[]): string {
  if (d.type === 'mesa') {
    const table = tables?.find((t) => t.id === d.tableId);
    return table ? table.name : `Mesa`;
  }
  if (d.type === 'barra') return 'Barra';
  return 'Para Llevar';
}

export function getTableName(tables: Table[], tableId: string): string {
  const table = tables.find((t) => t.id === tableId);
  return table ? table.name : `Mesa ${tableId}`;
}

export const money = (n: number) => `Bs. ${n.toLocaleString('es-CO')}`;
