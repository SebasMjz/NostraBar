import { useEffect, useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  LayoutGrid,
  Receipt,
  ShoppingCart,
  Table2,
  TrendingUp,
  Users as UsersIcon,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import { money } from '@/lib/format';
import { useStore } from '@/store';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import type { CategoryItem, CategoryKey, Product, Role, Table } from '@/types';
import { ProductFormModal, type ProductFormData } from '@/components/ProductFormModal';
import { NavBtn } from './admin/ui/NavBtn';
import { DashboardTab } from './admin/DashboardTab';
import { InventoryTab } from './admin/InventoryTab';
import { CategoriesTab } from './admin/CategoriesTab';
import { TablesTab } from './admin/TablesTab';
import { HistoryTab } from './admin/HistoryTab';
import { UsersTab } from './admin/UsersTab';
import { CashRegisterTab } from './admin/CashRegisterTab';
import { CategoryModal } from './admin/modals/CategoryModal';
import { TableModal } from './admin/modals/TableModal';
import { UserModal } from './admin/modals/UserModal';

type AdminTab = 'dashboard' | 'inventario' | 'categorias' | 'mesas' | 'historial' | 'cajas' | 'usuarios';

export function AdminView() {
  const {
    setRole,
    categories, addCategory, updateCategory, removeCategory,
    products, toggleAvailable, addProduct, updateProduct, removeProduct,
    tables, addTable, updateTable, removeTable,
    orders, transactions,
    printReceipt,
    activeCashRegister, openCashRegister, closeCashRegister,
  } = useStore();
  const { createUser, listUsers, toggleUserActive, deleteUser, user: currentUser } = useAuth();

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productModalCategory, setProductModalCategory] = useState<CategoryKey>('espresso');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('✨');

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableNumber, setNewTableNumber] = useState(1);
  const [newTableCapacity, setNewTableCapacity] = useState(4);

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
        {tab === 'dashboard' && (
          <DashboardTab
            todayTotal={todayTotal}
            avgTicket={avgTicket}
            activeTableIds={activeTableIds}
            outStock={outStock}
            orders={orders}
            tables={tables}
            toggleAvailable={toggleAvailable}
          />
        )}

        {tab === 'inventario' && (
          <InventoryTab
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleCreateProduct={handleCreateProduct}
            handleEditProduct={handleEditProduct}
            handleDeleteProduct={handleDeleteProduct}
            toggleAvailable={toggleAvailable}
            getCategoryStats={getCategoryStats}
            getProductsByCategory={getProductsByCategory}
          />
        )}

        {tab === 'categorias' && (
          <CategoriesTab
            categories={categories}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            setEditingCategory={setEditingCategory}
            handleDeleteCategory={handleDeleteCategory}
            getCategoryStats={getCategoryStats}
          />
        )}

        {tab === 'mesas' && (
          <TablesTab
            tables={tables}
            orders={orders}
            setIsTableModalOpen={setIsTableModalOpen}
            setEditingTable={setEditingTable}
            setNewTableName={setNewTableName}
            setNewTableNumber={setNewTableNumber}
            setNewTableCapacity={setNewTableCapacity}
            handleDeleteTable={handleDeleteTable}
          />
        )}

        {tab === 'historial' && (
          <HistoryTab
            todayTotal={todayTotal}
            avgTicket={avgTicket}
            transactions={transactions}
            orders={orders}
            expandedTxId={expandedTxId}
            setExpandedTxId={setExpandedTxId}
            printReceipt={printReceipt}
          />
        )}

        {tab === 'usuarios' && (
          <UsersTab
            usersList={usersList}
            usersLoading={usersLoading}
            setIsUserModalOpen={setIsUserModalOpen}
            handleDeleteUser={handleDeleteUser}
            toggleUserActive={toggleUserActive}
            currentUser={currentUser}
          />
        )}

        {tab === 'cajas' && (
          <CashRegisterTab
            activeCashRegister={activeCashRegister}
            openCashRegister={openCashRegister}
            closeCashRegister={closeCashRegister}
            transactions={transactions}
          />
        )}

        {/* Modals */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
          defaultCategory={productModalCategory}
          initialData={editingProduct ? { ...editingProduct, variants: editingProduct.variants || [], modifiers: editingProduct.modifiers || [], availableExtras: editingProduct.availableExtras || [] } : undefined}
          title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          newCatName={newCatName}
          setNewCatName={setNewCatName}
          newCatEmoji={newCatEmoji}
          setNewCatEmoji={setNewCatEmoji}
          handleCreateCategory={handleCreateCategory}
          updateCategory={updateCategory}
        />

        <TableModal
          isOpen={isTableModalOpen}
          onClose={() => { setIsTableModalOpen(false); setEditingTable(null); }}
          editingTable={editingTable}
          setEditingTable={setEditingTable}
          newTableName={newTableName}
          setNewTableName={setNewTableName}
          newTableNumber={newTableNumber}
          setNewTableNumber={setNewTableNumber}
          newTableCapacity={newTableCapacity}
          setNewTableCapacity={setNewTableCapacity}
          handleCreateTable={handleCreateTable}
          updateTable={updateTable}
        />

        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          newUserName={newUserName}
          setNewUserName={setNewUserName}
          newUserUsername={newUserUsername}
          setNewUserUsername={setNewUserUsername}
          newUserPassword={newUserPassword}
          setNewUserPassword={setNewUserPassword}
          newUserRole={newUserRole}
          setNewUserRole={setNewUserRole}
          handleCreateUser={handleCreateUser}
          creatingUser={creatingUser}
        />
      </main>
    </div>
  );
}
