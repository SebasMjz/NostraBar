import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Edit3,
  Grid3X3,
  LayoutGrid,
  Loader2,
  Plus,
  Receipt,
  Settings,
  ShoppingCart,
  Table2,
  Trash2,
  TrendingUp,
  UserPlus,
  Users as UsersIcon,
  UtensilsCrossed,
  Wallet,
  X,
} from 'lucide-react';
import { categoryLabels, categoryEmojis, destLabel, getTableName, money, useStore } from '@/store';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import type { CategoryItem, CategoryKey, Order, PaymentMethod, Product, Role, Table } from '@/types';
import { ProductFormModal, type ProductFormData } from '@/components/ProductFormModal';

type AdminTab = 'dashboard' | 'inventario' | 'categorias' | 'mesas' | 'historial' | 'cajas' | 'usuarios';

const methodLabels: Record<PaymentMethod, string> = {
  qr: 'QR',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
};

export function AdminView() {
  const {
    setRole,
    categories, addCategory, updateCategory, removeCategory,
    products, toggleAvailable, addProduct, updateProduct, removeProduct,
    tables, addTable, updateTable, removeTable,
    orders, transactions,
    activeCashRegister, openCashRegister, closeCashRegister,
  } = useStore();
  const { createUser, listUsers, toggleUserActive, deleteUser, user: currentUser } = useAuth();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productModalCategory, setProductModalCategory] = useState<CategoryKey>('espresso');

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('✨');

  // Table modal
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableNumber, setNewTableNumber] = useState(1);
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  // Users
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('cajero');
  const [creatingUser, setCreatingUser] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const todayTotal = transactions.reduce((s, t) => s + t.total, 0);
  const avgTicket = transactions.length ? Math.round(todayTotal / transactions.length) : 0;
  const activeTableIds = new Set(
    orders.filter((o) => o.destination.type === 'mesa' && o.status !== 'despachado')
      .map((o) => o.destination.type === 'mesa' ? o.destination.tableId : ''),
  ).size;
  const outStock = products.filter((p) => !p.available && p.price > 0);

  // Product handlers
  const handleCreateProduct = (category?: CategoryKey) => {
    setEditingProduct(null);
    setProductModalCategory(category || selectedCategory || 'espresso');
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalCategory(product.category);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Eliminar este producto?')) {
      removeProduct(productId);
    }
  };

  const handleSaveProduct = (data: ProductFormData) => {
    const primaryVariant = data.useVariants ? data.variants[0] : undefined;
    const price = data.useVariants ? (primaryVariant?.price || 0) : data.basePrice;

    const productData = {
      name: data.name,
      category: data.category,
      available: data.available,
      price,
      modifiers: data.modifiers,
      availableExtras: data.availableExtras,
      variants: data.useVariants ? data.variants : [],
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct({ ...productData, stock: 100 });
    }
  };

  // Category handlers
  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const key = newCatName.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 15) as CategoryKey;
    addCategory({ key, name: newCatName.trim(), emoji: newCatEmoji });
    setNewCatName('');
    setNewCatEmoji('✨');
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    const count = products.filter((p) => p.category === cat.key).length;
    if (count > 0) {
      alert(`No se puede eliminar: hay ${count} productos en esta categoría.`);
      return;
    }
    if (window.confirm(`¿Eliminar "${cat.name}"?`)) {
      removeCategory(id);
    }
  };

  // Table handlers
  const handleCreateTable = () => {
    if (!newTableName.trim()) return;
    addTable({ number: newTableNumber, name: newTableName.trim(), capacity: newTableCapacity, available: true });
    setNewTableName('');
    setNewTableNumber(tables.length + 1);
    setNewTableCapacity(4);
    setIsTableModalOpen(false);
  };

  const handleDeleteTable = (id: string) => {
    if (window.confirm('¿Eliminar esta mesa?')) {
      removeTable(id);
    }
  };

  // Users handlers
  useEffect(() => {
    if (tab === 'usuarios') {
      setUsersLoading(true);
      listUsers().then((users) => { setUsersList(users); setUsersLoading(false); });
    }
  }, [tab, listUsers]);

  const handleCreateUser = async () => {
    if (!newUserUsername.trim() || !newUserName.trim() || !newUserPassword.trim()) return;
    setCreatingUser(true);
    const result = await createUser(newUserUsername.trim(), newUserPassword.trim(), newUserName.trim(), newUserRole);
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      setIsUserModalOpen(false);
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('');
      setNewUserRole('cajero');
      const users = await listUsers();
      setUsersList(users);
    }
    setCreatingUser(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }
    if (window.confirm('¿Eliminar este usuario?')) {
      await deleteUser(userId);
      const users = await listUsers();
      setUsersList(users);
    }
  };

  const getProductsByCategory = (category: CategoryKey) => {
    let filtered = products.filter((p) => p.category === category);
    if (searchQuery) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const getCategoryStats = (category: CategoryKey) => {
    const catProducts = products.filter((p) => p.category === category);
    return { available: catProducts.filter((p) => p.available).length, total: catProducts.length };
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] bg-stone-100">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-stone-200 bg-white">
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-800 text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">Admin</p>
            <p className="text-[11px] text-stone-400">Panel de Control</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          <NavBtn active={tab === 'dashboard'} onClick={() => setTab('dashboard')} icon={TrendingUp} label="Dashboard" />
          <NavBtn active={tab === 'inventario'} onClick={() => { setTab('inventario'); setSelectedCategory(null); }} icon={ClipboardList} label="Inventario" />
          <NavBtn active={tab === 'categorias'} onClick={() => setTab('categorias')} icon={LayoutGrid} label="Categorías" />
          <NavBtn active={tab === 'mesas'} onClick={() => setTab('mesas')} icon={Table2} label="Mesas" />
          <NavBtn active={tab === 'historial'} onClick={() => setTab('historial')} icon={Receipt} label="Historial" />
          <NavBtn active={tab === 'cajas'} onClick={() => setTab('cajas')} icon={Wallet} label="Apertura / Cierre Cajas" />
          <NavBtn active={tab === 'usuarios'} onClick={() => setTab('usuarios')} icon={UsersIcon} label="Usuarios" />
        </nav>

        <div className="mx-3 mt-4 rounded-xl bg-stone-50 p-3 space-y-2">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Resumen</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Ventas</span>
            <span className="font-semibold text-stone-700">{money(todayTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Pedidos</span>
            <span className="font-semibold text-stone-700">{orders.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Mesas activas</span>
            <span className="font-semibold text-emerald-600">{activeTableIds}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Productos</span>
            <span className="font-semibold text-stone-700">{products.length}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-stone-200 p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">Accesos Rápidos</p>
          <button onClick={() => setRole('cajero')} className="mb-2 flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100">
            <ShoppingCart className="h-4 w-4" /> Terminal POS
          </button>
          <button onClick={() => setRole('kds')} className="flex w-full items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100">
            <UtensilsCrossed className="h-4 w-4" /> Pantalla KDS
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-stone-800">Dashboard</h1>
              <p className="text-sm text-stone-500">Métricas del turno actual</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard icon={Wallet} label="Ventas" value={money(todayTotal)} tone="amber" />
              <KpiCard icon={Receipt} label="Ticket Promedio" value={money(avgTicket)} tone="stone" />
              <KpiCard icon={ArrowLeftRight} label="Mesas Activas" value={`${activeTableIds}`} tone="emerald" />
              <KpiCard icon={AlertTriangle} label="Agotados" value={`${outStock.length}`} tone="red" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Panel title="Comandas Activas" icon={UtensilsCrossed}>
                {orders.filter((o) => o.status !== 'despachado').length === 0 ? (
                  <Empty text="No hay comandas activas." />
                ) : (
                  <ul className="space-y-2">
                    {orders.filter((o) => o.status !== 'despachado').map((o) => (
                      <li key={o.id} className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm">
                        <div>
                          <p className="font-semibold text-stone-700">{o.ticket} · {o.destination.type === 'mesa' ? getTableName(tables, o.destination.tableId) : o.destination.type === 'barra' ? 'Barra' : 'Para Llevar'}</p>
                          <p className="text-xs text-stone-400">{o.items.length} ítems · {money(o.total)}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          o.status === 'nuevo' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'preparacion' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {o.status === 'nuevo' ? 'Nuevo' : o.status === 'preparacion' ? 'Preparación' : 'Listo'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Productos Agotados" icon={AlertTriangle}>
                {outStock.length === 0 ? (
                  <Empty text="Todos los productos disponibles." />
                ) : (
                  <ul className="space-y-2">
                    {outStock.slice(0, 5).map((p) => (
                      <li key={p.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
                        <span className="font-medium text-stone-700">{p.name}</span>
                        <button onClick={() => toggleAvailable(p.id)} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                          Activar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        )}

        {/* INVENTARIO */}
        {tab === 'inventario' && !selectedCategory && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-stone-800">Inventario</h1>
              <p className="text-sm text-stone-500">Selecciona una categoría</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => {
                const stats = getCategoryStats(cat.key);
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.key)} className="group flex flex-col items-center rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all hover:border-amber-400 hover:shadow-md">
                    <span className="mb-3 text-4xl">{cat.emoji}</span>
                    <h3 className="mb-1 text-sm font-semibold text-stone-700">{cat.name}</h3>
                    <p className="text-xs text-stone-400">{stats.available}/{stats.total} disponibles</p>
                    <ChevronRight className="mt-3 h-4 w-4 text-stone-300 transition-colors group-hover:text-amber-500" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'inventario' && selectedCategory && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedCategory(null)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200">
                <X className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryEmojis[selectedCategory]}</span>
                  <h1 className="font-serif text-2xl font-semibold text-stone-800">{categoryLabels[selectedCategory]}</h1>
                </div>
              </div>
              <button onClick={() => handleCreateProduct(selectedCategory)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
                <Plus className="h-4 w-4" /> Nuevo Producto
              </button>
            </div>
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar..." className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {getProductsByCategory(selectedCategory).map((product) => (
                <ProductCard key={product.id} product={product} onToggle={() => toggleAvailable(product.id)} onEdit={() => handleEditProduct(product)} onDelete={() => handleDeleteProduct(product.id)} />
              ))}
              {getProductsByCategory(selectedCategory).length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-stone-400">No hay productos</p>
                  <button onClick={() => handleCreateProduct(selectedCategory)} className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700">+ Agregar producto</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORÍAS */}
        {tab === 'categorias' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-stone-800">Categorías</h1>
                <p className="text-sm text-stone-500">Gestionar categorías de productos</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
                <Plus className="h-4 w-4" /> Nueva Categoría
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const stats = getCategoryStats(cat.key);
                return (
                  <div key={cat.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cat.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-stone-700">{cat.name}</h3>
                          <p className="text-xs text-stone-400">{stats.total} productos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingCategory(cat)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MESAS */}
        {tab === 'mesas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-stone-800">Mesas</h1>
                <p className="text-sm text-stone-500">Gestionar mesas del restaurante</p>
              </div>
              <button onClick={() => setIsTableModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
                <Plus className="h-4 w-4" /> Nueva Mesa
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tables.map((table) => {
                const isActive = orders.some((o) => o.destination.type === 'mesa' && o.destination.tableId === table.id && o.status !== 'despachado');
                return (
                  <div key={table.id} className={`rounded-xl border bg-white p-5 shadow-sm ${isActive ? 'border-amber-400' : 'border-stone-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Table2 className={`h-5 w-5 ${isActive ? 'text-amber-500' : 'text-stone-400'}`} />
                          <h3 className="font-semibold text-stone-700">{table.name}</h3>
                        </div>
                        <p className="mt-1 text-xs text-stone-400">Capacidad: {table.capacity} personas</p>
                        {isActive && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Ocupada</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingTable(table); setNewTableName(table.name); setNewTableNumber(table.number); setNewTableCapacity(table.capacity); setIsTableModalOpen(true); }} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteTable(table.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tables.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm text-stone-400">No hay mesas creadas</p>
                  <button onClick={() => setIsTableModalOpen(true)} className="mt-3 text-sm font-medium text-amber-600 hover:text-amber-700">+ Crear primera mesa</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {tab === 'historial' && (
          <div className="space-y-5">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-stone-800">Historial</h1>
              <p className="text-sm text-stone-500">Transacciones del día</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KpiCard icon={Wallet} label="Total" value={money(todayTotal)} tone="amber" small />
              <KpiCard icon={Receipt} label="Transacciones" value={`${transactions.length}`} tone="stone" small />
              <KpiCard icon={TrendingUp} label="Promedio" value={money(avgTicket)} tone="emerald" small />
            </div>
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ticket</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <th className="px-4 py-3 font-semibold">Método</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transactions.map((t) => {
                    const isExpanded = expandedTxId === t.id;
                    const matchedOrder = orders.find((o) => o.ticket === t.ticket);
                    return (
                      <React.Fragment key={t.id}>
                        <tr
                          onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                          className="cursor-pointer hover:bg-stone-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-stone-700 flex items-center gap-2">
                            <span className="text-stone-400 text-xs font-bold">{isExpanded ? '▲' : '▼'}</span>
                            {t.ticket}
                          </td>
                          <td className="px-4 py-3 text-stone-500">{t.label}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              t.method === 'qr' ? 'bg-violet-100 text-violet-700' :
                              t.method === 'tarjeta' ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>{methodLabels[t.method]}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-stone-700">{money(t.total)}</td>
                          <td className="px-4 py-3 text-stone-400">{new Date(t.time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="bg-stone-50 px-6 py-4 border-b border-stone-200">
                              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2">
                                  <h4 className="text-sm font-bold text-stone-800">Detalle del Ticket {t.ticket} ({t.label})</h4>
                                  {matchedOrder && (
                                    <button onClick={(e) => { e.stopPropagation(); printReceipt(matchedOrder.id); }} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50">
                                      <Printer className="h-3.5 w-3.5" /> Imprimir Recibo
                                    </button>
                                  )}
                                </div>
                                {matchedOrder && matchedOrder.items ? (
                                  <ul className="divide-y divide-stone-100 text-xs">
                                    {matchedOrder.items.map((item) => (
                                      <li key={item.id} className="py-2 flex justify-between">
                                        <div>
                                          <span className="font-semibold text-stone-800">{item.qty}x {item.name}</span>
                                          {item.modifiers.length > 0 && <p className="text-[10px] text-amber-600">{item.modifiers.join(', ')}</p>}
                                          {item.extras.length > 0 && (
                                            <p className="text-[10px] text-violet-600">{item.extras.map((e) => `${e.name} (+${money(e.price)})`).join(', ')}</p>
                                          )}
                                        </div>
                                        <span className="font-bold text-stone-700">{money(item.price * item.qty)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-stone-500 italic">Venta registrada - Total: {money(t.total)} en {methodLabels[t.method]}</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {tab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-stone-800">Usuarios</h1>
                <p className="text-sm text-stone-500">Gestionar usuarios del sistema</p>
              </div>
              <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
                <UserPlus className="h-4 w-4" /> Nuevo Usuario
              </button>
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nombre</th>
                      <th className="px-4 py-3 font-semibold">Usuario</th>
                      <th className="px-4 py-3 font-semibold">Rol</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50/60">
                        <td className="px-4 py-3 font-medium text-stone-700">{u.full_name}</td>
                        <td className="px-4 py-3 text-stone-500 font-mono text-xs">@{u.username}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-700' :
                            u.role === 'cajero' ? 'bg-blue-100 text-blue-700' :
                            u.role === 'mesero' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-violet-100 text-violet-700'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleUserActive(u.id, !u.active)}
                            disabled={u.id === currentUser?.id}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                              u.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {u.active ? '● Activo' : '○ Inactivo'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {u.id !== currentUser?.id && (
                            <button onClick={() => handleDeleteUser(u.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-stone-400">
                          No hay usuarios registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
              <p className="font-semibold text-stone-600">Nota:</p>
              <p>La contraseña por defecto es <code className="rounded bg-stone-200 px-1 py-0.5 font-mono text-stone-700">{'{rol}{nombre}'}</code>. Ejemplo: para "Juan" con rol cajero, la contraseña es <code className="rounded bg-stone-200 px-1 py-0.5 font-mono text-stone-700">cajerojuan</code>.</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal Producto */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        defaultCategory={productModalCategory}
        initialData={editingProduct ? { ...editingProduct, variants: editingProduct.variants || [], modifiers: editingProduct.modifiers || [], availableExtras: editingProduct.availableExtras || [] } : undefined}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      />

      {/* Modal Categoría */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">{editingCategory ? 'Editar' : 'Nueva'} Categoría</h3>
              <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Nombre</label>
                <input value={editingCategory ? editingCategory.name : newCatName} onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCatName(e.target.value)} placeholder="Ej: Postres" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Emoji</label>
                <input value={editingCategory ? editingCategory.emoji : newCatEmoji} onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, emoji: e.target.value }) : setNewCatEmoji(e.target.value)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
            </div>
            <button
              onClick={() => {
                if (editingCategory) {
                  updateCategory(editingCategory.id, { name: editingCategory.name, emoji: editingCategory.emoji });
                  setEditingCategory(null);
                } else {
                  handleCreateCategory();
                }
                setIsCategoryModalOpen(false);
              }}
              disabled={editingCategory ? false : !newCatName.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40"
            >
              {editingCategory ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Mesa */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => { setIsTableModalOpen(false); setEditingTable(null); }}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">{editingTable ? 'Editar' : 'Nueva'} Mesa</h3>
              <button onClick={() => { setIsTableModalOpen(false); setEditingTable(null); }} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Nombre</label>
                <input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="Ej: Mesa Terraza" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-500">Número</label>
                  <input type="number" value={newTableNumber} onChange={(e) => setNewTableNumber(parseInt(e.target.value) || 1)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" min="1" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-500">Capacidad</label>
                  <input type="number" value={newTableCapacity} onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 2)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" min="1" />
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (editingTable) {
                  updateTable(editingTable.id, { name: newTableName, number: newTableNumber, capacity: newTableCapacity });
                } else {
                  handleCreateTable();
                }
                setIsTableModalOpen(false);
                setEditingTable(null);
              }}
              disabled={!newTableName.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40"
            >
              {editingTable ? 'Guardar' : 'Crear Mesa'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Usuario */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setIsUserModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">Nuevo Usuario</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Nombre completo</label>
                <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Nombre de usuario (Username)</label>
                <input value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} placeholder="Ej: meserojuan" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Contraseña</label>
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Contraseña de acceso" className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-500">Rol</label>
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as Role)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400">
                  <option value="admin">Administrador</option>
                  <option value="cajero">Cajero</option>
                  <option value="mesero">Mesero</option>
                  <option value="cocina">Cocina</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreateUser}
              disabled={creatingUser || !newUserName.trim() || !newUserUsername.trim() || !newUserPassword.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-sm font-semibold text-white hover:bg-stone-900 disabled:opacity-40">
              {creatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {creatingUser ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </div>
      )}

      {/* CAJAS TAB */}
        {tab === 'cajas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-stone-800">Control de Cajas y Turnos</h1>
                <p className="text-sm text-stone-500">Gestión de aperturas, arqueos independientes y cierres de caja</p>
              </div>
            </div>

            {/* Current Active Cash Register Status Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeCashRegister ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">Estado de Caja Actual</h3>
                    <p className="text-xs text-stone-400">
                      {activeCashRegister
                        ? `Apertura realizada el ${new Date(activeCashRegister.opened_at).toLocaleString('es-CO')}`
                        : 'No hay ninguna caja abierta en este momento.'}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeCashRegister ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {activeCashRegister ? '🟢 Caja Abierta' : '🔴 Caja Cerrada'}
                </span>
              </div>

              {activeCashRegister && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Fondo Inicial</p>
                    <p className="text-xl font-bold text-stone-800 mt-1">{money(activeCashRegister.initial_amount)}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Ventas Efectivo</p>
                    <p className="text-xl font-bold text-amber-900 mt-1">+{money(transactions.filter((t) => t.method === 'efectivo').reduce((s, t) => s + t.total, 0))}</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Ventas QR</p>
                    <p className="text-xl font-bold text-blue-900 mt-1">+{money(transactions.filter((t) => t.method === 'qr').reduce((s, t) => s + t.total, 0))}</p>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-800">Ventas Tarjeta</p>
                    <p className="text-xl font-bold text-purple-900 mt-1">+{money(transactions.filter((t) => t.method === 'tarjeta').reduce((s, t) => s + t.total, 0))}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {activeCashRegister ? (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Proceder a realizar el arqueo y cierre de caja?')) {
                        closeCashRegister(
                          activeCashRegister.initial_amount + transactions.reduce((s, t) => s + t.total, 0),
                          'Cierre administrativo desde panel Admin'
                        );
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-black"
                  >
                    <Wallet className="h-4 w-4" /> Realizar Arqueo y Cierre de Caja
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const amountStr = window.prompt('Ingrese el monto de fondo inicial para abrir caja (Bs.):', '200');
                      if (amountStr) {
                        const amount = parseFloat(amountStr);
                        if (!isNaN(amount) && amount >= 0) openCashRegister(amount);
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Abrir Nueva Caja / Turno
                  </button>
                )}
              </div>
            </div>

            {/* Audit History Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-stone-800">Resumen y Desglose de Ventas del Turno</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 font-bold uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="p-3">Ticket</th>
                      <th className="p-3">Mesa / Destino</th>
                      <th className="p-3">Método de Pago</th>
                      <th className="p-3 text-right">Monto Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-800">{tx.ticket}</td>
                        <td className="p-3 text-stone-600">{tx.label}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-0.5 font-semibold ${
                            tx.method === 'efectivo' ? 'bg-amber-100 text-amber-800' :
                            tx.method === 'qr' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {methodLabels[tx.method]}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-stone-800">{money(tx.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && <Empty text="No hay transacciones registradas en este turno." />}
              </div>
            </div>
          </div>
        )}
      </div>
    )}
}

// COMPONENTS

function ProductCard({ product, onToggle, onEdit, onDelete }: { product: Product; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${product.available ? 'border-stone-200 hover:border-amber-400' : 'border-stone-200 bg-stone-50 opacity-75'}`}>
      <div className="mb-3 flex items-start justify-between">
        <h3 className="flex-1 font-semibold text-stone-700">{product.name}</h3>
        <button onClick={onToggle} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${product.available ? 'bg-emerald-500' : 'bg-stone-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${product.available ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
      {product.variants && product.variants.length > 0 ? (
        <div className="mb-3 space-y-1">
          {product.variants.map((v, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-stone-500">{v.name}</span>
              <span className="font-semibold text-stone-700">{money(v.price)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-lg font-bold text-stone-800">{money(product.price)}</p>
      )}
      {product.modifiers && product.modifiers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {product.modifiers.slice(0, 3).map((mod, i) => (
            <span key={i} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">{mod}</span>
          ))}
          {product.modifiers.length > 3 && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">+{product.modifiers.length - 3}</span>}
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-stone-100 pt-3">
        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200">
          <Edit3 className="h-3 w-3" /> Editar
        </button>
        <button onClick={onDelete} className="flex items-center justify-center rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof TrendingUp; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function KpiCard({ icon: Icon, label, value, tone, small }: { icon: typeof TrendingUp; label: string; value: string; tone: 'amber' | 'stone' | 'emerald' | 'red'; small?: boolean }) {
  const tones = { amber: 'from-amber-500 to-amber-600 text-amber-50', stone: 'from-stone-600 to-stone-700 text-stone-50', emerald: 'from-emerald-500 to-emerald-600 text-emerald-50', red: 'from-red-500 to-red-600 text-red-50' };
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{label}</p>
          <p className={`font-semibold text-stone-800 ${small ? 'text-lg' : 'text-xl'}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof TrendingUp; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-stone-400">{text}</p>;
}
