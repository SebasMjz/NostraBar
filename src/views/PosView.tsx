import { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  Minus,
  Plus,
  Printer,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { categoryLabels, destLabel, getTableName, money, posCategories, useStore } from '@/store';
import type { CategoryKey, Order, OrderItemExtra, PaymentMethod, PaymentSplit, Product, Table, Transaction } from '@/types';

function emojiFor(p: Product): string {
  if (p.category === 'espresso') return '☕';
  if (p.category === 'filtrados') return '🫖';
  if (p.category === 'frias') return '🧊';
  if (p.category === 'pasteleria') return '🥐';
  return '📦';
}

export function PosView() {
  const {
    role,
    products,
    tables,
    orders,
    transactions,
    activeItems,
    activeDestination,
    setActiveDestination,
    addToComanda,
    removeExtraFromItem,
    changeQty,
    removeItem,
    setItemNote,
    clearComanda,
    discount,
    setDiscount,
    sendToKitchen,
    addItemToOrder,
    getOrderForTable,
    payOrder,
    transferTable,
    printReceipt,
    activeCashRegister,
    openCashRegister,
    closeCashRegister,
    readyAlerts,
    dismissReadyAlert,
  } = useStore();

  const [cat, setCat] = useState<CategoryKey>('espresso');
  const [query, setQuery] = useState('');
  const [payModal, setPayModal] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [modifierPicker, setModifierPicker] = useState<Product | null>(null);
  const [extrasPicker, setExtrasPicker] = useState<Product | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([]);
  const [pendingMods, setPendingMods] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'tables' | 'catalog' | 'orderDetail' | 'preview'>('tables');
  const [previewItems, setPreviewItems] = useState<{ mods: string[]; extras: OrderItemExtra[] }>({ mods: [], extras: [] });

  const [isCashOpenModal, setIsCashOpenModal] = useState(false);
  const [isCashCloseModal, setIsCashCloseModal] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [initialCashInput, setInitialCashInput] = useState<number>(200);
  const [countedCashInput, setCountedCashInput] = useState<number>(0);
  const [cashNotesInput, setCashNotesInput] = useState<string>('');

  const isMesero = role === 'mesero';
  const isCajero = role === 'cajero';
  const showTables = isMesero || isCajero;

  const activeOrder = useMemo(() => {
    if (activeDestination.type === 'mesa') {
      return getOrderForTable(activeDestination.tableId);
    }
    if (activeDestination.type === 'barra') {
      return orders.find((o) => o.destination.type === 'barra' && !o.paid);
    }
    if (activeDestination.type === 'llevar') {
      return orders.find((o) => o.destination.type === 'llevar' && !o.paid);
    }
    return null;
  }, [activeDestination, orders, getOrderForTable]);

  const occupiedTableIds = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.destination.type === 'mesa' && !o.paid) set.add(o.destination.tableId);
    });
    return set;
  }, [orders]);

  const catalog = useMemo(() => {
    const list = products.filter((p) => p.category === cat && p.price > 0);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, cat, query]);

  const subtotal = useMemo(() => {
    return activeItems.reduce((s, i) => {
      const extrasTotal = i.extras.reduce((es, e) => es + e.price * e.qty, 0);
      return s + (i.price + extrasTotal) * i.qty;
    }, 0);
  }, [activeItems]);
  const total = Math.max(0, subtotal - discount);

  const handleProductClick = (p: Product) => {
    if (!p.available) return;
    const hasExtras = products.filter((ep) => ep.category === 'extras' && ep.available && p.availableExtras?.includes(ep.id)).length > 0;
    const hasModifiers = p.modifiers && p.modifiers.length > 0;

    if (hasModifiers) {
      setPendingMods([]);
      setModifierPicker(p);
    } else if (hasExtras) {
      setPendingMods([]);
      setSelectedExtras([]);
      setExtrasPicker(p);
    } else {
      addToComanda(p, [], []);
    }
  };

  const handleTableSelect = (tableId: string) => {
    setActiveDestination({ type: 'mesa', tableId });
    const existingOrder = orders.find((o) => o.destination.type === 'mesa' && o.destination.tableId === tableId && !o.paid);
    if (existingOrder) {
      setViewMode('orderDetail');
    } else {
      setViewMode('catalog');
    }
  };

  const handleSendToKitchen = async () => {
    await sendToKitchen();
    if (showTables) setViewMode('tables');
  };

  const showCatalog = !showTables || viewMode === 'catalog';
  const showOrderDetail = showTables && viewMode === 'orderDetail' && activeOrder;
  const showPreview = viewMode === 'preview';

  const activeReadyAlerts = useMemo(() => {
    return readyAlerts.map((key) => {
      const tableId = key.replace('mesa', '');
      const table = tables.find((t) => t.id === tableId);
      const order = orders.find((o) => o.destination.type === 'mesa' && o.destination.tableId === tableId && !o.paid);
      return { key, table, order };
    }).filter((a) => a.table && a.order);
  }, [readyAlerts, tables, orders]);

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col bg-stone-100 lg:flex-row">
      {/* Ready alert banner for mesero */}
      {isMesero && activeReadyAlerts.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          {activeReadyAlerts.map((alert) => (
            <div key={alert.key} className="mb-2 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 last:mb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">¡Pedido listo para despachar!</p>
                  <p className="text-xs text-amber-700">{alert.table?.name} - Ticket {alert.order?.ticket}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { handleTableSelect(alert.table!.id); dismissReadyAlert(alert.key); }} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
                  Recoger
                </button>
                <button onClick={() => dismissReadyAlert(alert.key)} className="text-amber-400 hover:text-amber-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tables view */}
        {showTables && viewMode === 'tables' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <h2 className="font-serif text-xl font-semibold text-stone-800">Seleccionar Mesa</h2>
              <p className="text-sm text-stone-500">{isCajero ? 'Selecciona una mesa para cobrar o agregar ítems' : 'Toca una mesa para ver o crear pedido'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tables.map((table) => {
                const occupied = occupiedTableIds.has(table.id);
                const order = orders.find((o) => o.destination.type === 'mesa' && o.destination.tableId === table.id && !o.paid);
                const isReady = order?.status === 'listo';
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableSelect(table.id)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                      isReady
                        ? 'border-red-400 bg-red-50 hover:border-red-500 animate-pulse'
                        : occupied
                          ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                          : 'border-emerald-300 bg-emerald-50 hover:border-emerald-500'
                    }`}
                  >
                    {isReady && (
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">!</span>
                    )}
                    <span className="text-3xl">{occupied ? '🍽️' : '✅'}</span>
                    <p className="mt-2 font-semibold text-stone-700">{table.name}</p>
                    <p className="text-xs text-stone-400">{table.capacity} personas</p>
                    {occupied && order && (
                      <div className="mt-2 text-xs">
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${
                          isReady ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                        }`}>
                          {isReady ? '¡Listo para despachar!' : `${order.items.length} ítems · ${money(order.total)}`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
              {(() => {
                const barraOrder = orders.find((o) => o.destination.type === 'barra' && !o.paid);
                const isBarraReady = barraOrder?.status === 'listo';
                return (
                  <button
                    onClick={() => {
                      setActiveDestination({ type: 'barra' });
                      if (barraOrder) setViewMode('orderDetail');
                      else setViewMode('catalog');
                    }}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                      isBarraReady
                        ? 'border-red-400 bg-red-50 hover:border-red-500 animate-pulse'
                        : barraOrder
                          ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                          : 'border-stone-300 bg-white hover:border-stone-500'
                    }`}
                  >
                    {isBarraReady && <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">!</span>}
                    <span className="text-3xl">🍺</span>
                    <p className="mt-2 font-semibold text-stone-700">Barra</p>
                    {barraOrder && (
                      <div className="mt-2 text-xs">
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${isBarraReady ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                          {isBarraReady ? '¡Listo!' : `${barraOrder.ticket} · ${money(barraOrder.total)}`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })()}
              {(() => {
                const llevarOrder = orders.find((o) => o.destination.type === 'llevar' && !o.paid);
                const isLlevarReady = llevarOrder?.status === 'listo';
                return (
                  <button
                    onClick={() => {
                      setActiveDestination({ type: 'llevar' });
                      if (llevarOrder) setViewMode('orderDetail');
                      else setViewMode('catalog');
                    }}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                      isLlevarReady
                        ? 'border-red-400 bg-red-50 hover:border-red-500 animate-pulse'
                        : llevarOrder
                          ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
                          : 'border-stone-300 bg-white hover:border-stone-500'
                    }`}
                  >
                    {isLlevarReady && <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-lg">!</span>}
                    <span className="text-3xl">📦</span>
                    <p className="mt-2 font-semibold text-stone-700">Para Llevar</p>
                    {llevarOrder && (
                      <div className="mt-2 text-xs">
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${isLlevarReady ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                          {isLlevarReady ? '¡Listo!' : `${llevarOrder.ticket} · ${money(llevarOrder.total)}`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* Order Detail view */}
        {showOrderDetail && activeOrder && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <button onClick={() => setViewMode('tables')} className="mb-2 text-sm text-stone-400 hover:text-stone-600">← Volver a mesas</button>
                <h2 className="font-serif text-xl font-semibold text-stone-800">{destLabel(activeDestination, tables)}</h2>
                <p className="text-sm text-stone-500">Pedido {activeOrder.ticket} · {activeOrder.items.length} ítems · {activeOrder.status === 'listo' ? '¡LISTO!' : activeOrder.status}</p>
              </div>
              <div className="flex gap-2">
                {activeDestination.type === 'mesa' && (
                  <button onClick={() => setIsTransferModalOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm">
                    ⇄ Cambiar Mesa
                  </button>
                )}
                <button onClick={() => setViewMode('catalog')} className="flex items-center gap-2 rounded-lg bg-stone-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-900">
                  <Plus className="h-4 w-4" /> Agregar ítems
                </button>
                {isCajero && (
                  <button onClick={() => { setPayingOrder(activeOrder); setPayModal(true); }} className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700">
                    <Wallet className="h-4 w-4" /> Cobrar {money(activeOrder.total)}
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
              <ul className="divide-y divide-stone-100">
                {activeOrder.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-700">{item.name}</span>
                        {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>
                      {item.modifiers.length > 0 && (
                        <p className="text-xs text-amber-600">{item.modifiers.join(', ')}</p>
                      )}
                      {item.extras.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.extras.map((e) => (
                            <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">
                              {e.name} +{money(e.price)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-stone-700">{item.qty}x {money(item.price)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Preview view */}
        {showPreview && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <button onClick={() => setViewMode('catalog')} className="mb-2 text-sm text-stone-400 hover:text-stone-600">← Volver al catálogo</button>
              <h2 className="font-serif text-xl font-semibold text-stone-800">Vista previa del pedido</h2>
              <p className="text-sm text-stone-500">Revisa antes de enviar a cocina</p>
            </div>
            {activeItems.length === 0 ? (
              <p className="py-10 text-center text-sm text-stone-400">No hay ítems en la comanda</p>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
                <ul className="divide-y divide-stone-100">
                  {activeItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-stone-700">{item.name}</span>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-amber-600">{item.modifiers.join(', ')}</p>
                        )}
                        {item.extras.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.extras.map((e) => (
                              <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">
                                {e.name} +{money(e.price)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-stone-700">{item.qty}x {money(item.price)}</p>
                        {item.note && <p className="text-xs text-stone-400">{item.note}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-stone-200 p-4">
                  <div className="mb-3 flex justify-between text-base font-bold text-stone-800">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewMode('catalog')} className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                      Seguir agregando
                    </button>
                    <button onClick={handleSendToKitchen} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900">
                      <Send className="h-4 w-4" /> Enviar a Cocina
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catalog view */}
        {showCatalog && (
          <>
            <div className="border-b border-stone-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showTables && (
                    <button onClick={() => setViewMode('tables')} className="text-stone-400 hover:text-stone-600">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-stone-700">
                      {showTables ? destLabel(activeDestination, tables) : 'Punto de Venta'}
                    </p>
                    {activeOrder && <p className="text-xs text-amber-600">Pedido activo: {activeOrder.ticket}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeCashRegister ? (
                    <button
                      onClick={() => {
                        const cashSales = transactions.filter((t) => t.method === 'efectivo').reduce((s, t) => s + t.total, 0);
                        setCountedCashInput((activeCashRegister.initial_amount || 0) + cashSales);
                        setIsCashCloseModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Caja Abierta · Cuadre
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsCashOpenModal(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
                    >
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      Caja Cerrada · Abrir
                    </button>
                  )}
                  {isCajero && activeOrder && (
                    <button onClick={() => { setPayingOrder(activeOrder); setPayModal(true); }} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
                      Cobrar {money(activeOrder.total)}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Destination selector for cajero when no table selected */}
            {isCajero && !showTables && (
              <div className="border-b border-stone-200 bg-white px-4 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {tables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setActiveDestination({ type: 'mesa', tableId: table.id })}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeDestination.type === 'mesa' && activeDestination.tableId === table.id
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {table.name}
                    </button>
                  ))}
                  <button onClick={() => setActiveDestination({ type: 'barra' })} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${activeDestination.type === 'barra' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                    Barra
                  </button>
                  <button onClick={() => setActiveDestination({ type: 'llevar' })} className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${activeDestination.type === 'llevar' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                    Para Llevar
                  </button>
                </div>
              </div>
            )}

            <div className="border-b border-stone-200 bg-white px-4 py-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar producto..." className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-700 outline-none focus:border-stone-400 focus:bg-white" />
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2.5">
              {posCategories.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${cat === c ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                  {categoryLabels[c]}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {catalog.map((p) => {
                  const extras = products.filter((ep) => ep.category === 'extras' && ep.available && p.availableExtras?.includes(ep.id));
                  return (
                    <button key={p.id} onClick={() => handleProductClick(p)} disabled={!p.available} className={`group relative flex flex-col rounded-xl border p-3 text-left transition-all ${p.available ? 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-md' : 'border-stone-200 bg-stone-100 opacity-60'}`}>
                      <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-amber-50 to-stone-100">
                        <span className="text-2xl">{emojiFor(p)}</span>
                      </div>
                      <p className="text-sm font-semibold leading-tight text-stone-700">{p.name}</p>
                      <span className="mt-1 text-sm font-bold text-amber-700">{money(p.price)}</span>
                      {extras.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {extras.slice(0, 3).map((e) => (
                            <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-600">
                              {e.name} {money(e.price)}
                            </span>
                          ))}
                          {extras.length > 3 && <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-500">+{extras.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {catalog.length === 0 && <p className="py-10 text-center text-sm text-stone-400">No se encontraron productos.</p>}
            </div>
          </>
        )}
      </div>

      {/* Right: comanda panel */}
      {showCatalog && (
        <aside className="flex w-full flex-col border-t border-stone-200 bg-white lg:w-96 lg:border-l lg:border-t-0">
          <div className="border-b border-stone-200 bg-stone-800 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold">Comanda</h2>
              </div>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">{destLabel(activeDestination, tables)}</span>
            </div>
          </div>

          {activeOrder && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-900 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Agregando a pedido {activeOrder.ticket}</p>
                <p className="text-[10px] text-amber-700">Estado en cocina: <span className="font-semibold capitalize">{activeOrder.status}</span></p>
              </div>
              <button onClick={() => setViewMode('orderDetail')} className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950">
                Ver pedido
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-300">
                <ShoppingCart className="mb-3 h-12 w-12" />
                <p className="text-sm font-medium">Vacía</p>
                <p className="text-xs text-stone-400">Toca productos para agregar</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {activeItems.map((item) => {
                  const itemExtrasTotal = item.extras.reduce((es, e) => es + e.price * e.qty, 0);
                  return (
                    <li key={item.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-stone-700">{item.name}</p>
                          {item.modifiers.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.modifiers.map((m) => (
                                <span key={m} className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">{m}</span>
                              ))}
                            </div>
                          )}
                          {item.extras.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.extras.map((e) => (
                                <span key={e.id} className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                                  {e.name} +{money(e.price)}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="mt-0.5 text-xs text-stone-400">{money(item.price)} c/u</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-sm font-semibold text-stone-700">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-100 text-stone-600 hover:bg-stone-200"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <span className="text-sm font-bold text-stone-700">{money((item.price + itemExtrasTotal) * item.qty)}</span>
                      </div>
                      <input value={item.note ?? ''} onChange={(e) => setItemNote(item.id, e.target.value)} placeholder="Nota..." className="mt-2 w-full rounded-md border border-stone-200 px-2 py-1.5 text-xs text-stone-600 outline-none focus:border-amber-400" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-stone-200 p-4">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex items-center justify-between text-stone-500">
                <span>Descuento</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setDiscount(Math.max(0, discount - 500))} className="flex h-6 w-6 items-center justify-center rounded bg-stone-100 hover:bg-stone-200"><Minus className="h-3 w-3" /></button>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 rounded border border-stone-200 px-1 py-0.5 text-center text-sm font-medium text-stone-700 outline-none focus:border-amber-400"
                  />
                  <button onClick={() => setDiscount(discount + 500)} className="flex h-6 w-6 items-center justify-center rounded bg-stone-100 hover:bg-stone-200"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-1.5 text-base font-bold text-stone-800"><span>Total</span><span>{money(total)}</span></div>
            </div>
            {activeItems.length > 0 && (
              <button onClick={() => setViewMode('preview')} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                <Eye className="h-4 w-4" /> Vista previa
              </button>
            )}
            <button onClick={handleSendToKitchen} disabled={activeItems.length === 0} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-700 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40">
              <Send className="h-4 w-4" /> Enviar a Cocina
            </button>
            {isCajero && activeItems.length > 0 && (
              <button onClick={() => setPayModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700">
                <Wallet className="h-4 w-4" /> Cobrar
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Modifier modal */}
      {modifierPicker && (
        <ModifierModal product={modifierPicker} onClose={() => setModifierPicker(null)} onConfirm={(mods) => {
          const hasExtras = products.filter((ep) => ep.category === 'extras' && ep.available && modifierPicker.availableExtras?.includes(ep.id)).length > 0;
          if (hasExtras) {
            setPendingMods(mods);
            setSelectedExtras([]);
            setExtrasPicker(modifierPicker);
            setModifierPicker(null);
          } else {
            addToComanda(modifierPicker, mods, []);
            setModifierPicker(null);
          }
        }} />
      )}

      {/* Extras modal */}
      {extrasPicker && (
        <ExtrasModal product={extrasPicker} products={products} selectedExtras={selectedExtras} onToggleExtra={(extra) => {
          setSelectedExtras((prev) => {
            const exists = prev.find((e) => e.id === extra.id);
            if (exists) return prev.filter((e) => e.id !== extra.id);
            return [...prev, { id: extra.id, name: extra.name, price: extra.price, qty: 1 }];
          });
        }} onClose={() => { setExtrasPicker(null); setPendingMods([]); }} onConfirm={(extras) => {
          addToComanda(extrasPicker, pendingMods, extras);
          setExtrasPicker(null); setSelectedExtras([]); setPendingMods([]);
        }} />
      )}

      {/* Cash Register Modals */}
      {isCashOpenModal && (
        <OpenCashModal onClose={() => setIsCashOpenModal(false)} onConfirm={(amount) => {
          openCashRegister(amount);
          setIsCashOpenModal(false);
        }} />
      )}
      {isCashCloseModal && activeCashRegister && (
        <CloseCashModal cashRegister={activeCashRegister} transactions={transactions} onClose={() => setIsCashCloseModal(false)} onConfirm={(finalAmount, notes) => {
          closeCashRegister(finalAmount, notes);
          setIsCashCloseModal(false);
        }} />
      )}

      {/* Transfer Table Modal */}
      {isTransferModalOpen && activeDestination.type === 'mesa' && (
        <TransferTableModal
          currentTableId={activeDestination.tableId}
          tables={tables}
          onClose={() => setIsTransferModalOpen(false)}
          onConfirm={async (toTableId) => {
            await transferTable(activeDestination.tableId, toTableId);
            setActiveDestination({ type: 'mesa', tableId: toTableId });
            setIsTransferModalOpen(false);
          }}
        />
      )}

      {/* Pay modal */}
      {payModal && payingOrder && (
        <PayModal order={payingOrder} onClose={() => { setPayModal(false); setPayingOrder(null); }} onConfirm={(payments) => {
          payOrder(payingOrder.id, payments);
          setPayModal(false);
          setPayingOrder(null);
          if (showTables) setViewMode('tables');
        }} onPrint={(orderId) => printReceipt(orderId)} />
      )}
    </div>
  );
}

interface ModifierModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (mods: string[]) => void;
}

function ModifierModal({ product, onClose, onConfirm }: ModifierModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (m: string) => setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">{product.name}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">Personalizaciones</p>
        <div className="flex flex-wrap gap-2">
          {product.modifiers?.map((m) => (
            <button key={m} onClick={() => toggle(m)} className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${selected.includes(m) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={() => onConfirm([])} className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Sin personalización
          </button>
          <button onClick={() => onConfirm(selected)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

interface ExtraToggleItem {
  id: string;
  name: string;
  price: number;
}

interface ExtrasModalProps {
  product: Product;
  products: Product[];
  selectedExtras: OrderItemExtra[];
  onToggleExtra: (extra: ExtraToggleItem) => void;
  onClose: () => void;
  onConfirm: (extras: OrderItemExtra[]) => void;
}

function ExtrasModal({ product, products, selectedExtras, onToggleExtra, onClose, onConfirm }: ExtrasModalProps) {
  const availableExtras = products.filter((p) => p.category === 'extras' && p.available && product.availableExtras?.includes(p.id));
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price * e.qty, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">{product.name}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">Extras</p>
        <div className="space-y-2">
          {availableExtras.map((extra) => {
            const isSelected = selectedExtras.some((e) => e.id === extra.id);
            return (
              <button key={extra.id} onClick={() => onToggleExtra({ id: extra.id, name: extra.name, price: extra.price })} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${isSelected ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                <span>{extra.name}</span>
                <span className="text-xs text-stone-400">+{money(extra.price)}</span>
              </button>
            );
          })}
        </div>
        {extrasTotal > 0 && <p className="mt-3 text-right text-sm font-semibold text-stone-700">Total: {money(extrasTotal)}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={() => onConfirm([])} className="flex-1 rounded-xl border border-stone-300 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Sin extra
          </button>
          <button onClick={() => onConfirm(selectedExtras)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferTableModal({ currentTableId, tables, onClose, onConfirm }: { currentTableId: string; tables: Table[]; onClose: () => void; onConfirm: (toTableId: string) => void }) {
  const currentTable = tables.find((t) => t.id === currentTableId);
  const availableTables = tables.filter((t) => t.id !== currentTableId && t.available);
  const [selectedToId, setSelectedToId] = useState<string>(availableTables[0]?.id || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-800">Transferir Comanda de Mesa</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-3 text-xs text-stone-500">
          Transfiere la comanda activa de <strong className="text-stone-800">{currentTable?.name || 'esta mesa'}</strong> a otra mesa libre.
        </p>

        {availableTables.length === 0 ? (
          <p className="py-4 text-center text-xs text-red-600 font-semibold">No hay otras mesas libres disponibles para transferir.</p>
        ) : (
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-stone-600">Seleccionar Mesa Destino:</label>
            <select
              value={selectedToId}
              onChange={(e) => setSelectedToId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm font-bold text-stone-800 outline-none focus:border-amber-400 focus:bg-white"
            >
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Capacidad: {t.capacity} personas)
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => onConfirm(selectedToId)}
          disabled={!selectedToId || availableTables.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-sm font-bold text-white shadow-md hover:bg-stone-900 disabled:opacity-40"
        >
          Confirmar Transferencia
        </button>
      </div>
    </div>
  );
}

function OpenCashModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (initialAmount: number) => void }) {
  const [amount, setAmount] = useState<number>(200);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-800">Apertura de Caja</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="mb-4 text-xs text-stone-500">Ingresa el monto de fondo inicial entregado a caja para el turno de hoy.</p>
        <div className="mb-5">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Fondo Inicial (Bs.)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-stone-300 bg-stone-50 py-3 px-4 text-xl font-bold text-stone-800 outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
        <button
          onClick={() => onConfirm(amount)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
        >
          <Wallet className="h-4 w-4" /> Abrir Caja e Iniciar Turno
        </button>
      </div>
    </div>
  );
}

function CloseCashModal({ cashRegister, transactions, onClose, onConfirm }: { cashRegister: any; transactions: Transaction[]; onClose: () => void; onConfirm: (finalAmount: number, notes?: string) => void }) {
  const initial = cashRegister.initial_amount || 0;
  const cashSales = transactions.filter((t) => t.method === 'efectivo').reduce((s, t) => s + t.total, 0);
  const qrSales = transactions.filter((t) => t.method === 'qr').reduce((s, t) => s + t.total, 0);
  const cardSales = transactions.filter((t) => t.method === 'tarjeta').reduce((s, t) => s + t.total, 0);

  const expectedCash = initial + cashSales;
  const expectedQr = qrSales;
  const expectedCard = cardSales;

  const [countedCash, setCountedCash] = useState<number>(expectedCash);
  const [countedQr, setCountedQr] = useState<number>(expectedQr);
  const [countedCard, setCountedCard] = useState<number>(expectedCard);
  const [notes, setNotes] = useState<string>('');

  const diffCash = countedCash - expectedCash;
  const diffQr = countedQr - expectedQr;
  const diffCard = countedCard - expectedCard;

  const renderBadge = (diff: number, label: string) => {
    if (diff === 0) return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">✓ {label} Cuadrado</span>;
    if (diff > 0) return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">+{money(diff)} (Sobrante)</span>;
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">-{money(Math.abs(diff))} (Faltante)</span>;
  };

  const handleConfirm = () => {
    const fullNotes = `Arqueo: Efectivo (${diffCash >= 0 ? '+' : ''}${diffCash}), QR (${diffQr >= 0 ? '+' : ''}${diffQr}), Tarjeta (${diffCard >= 0 ? '+' : ''}${diffCard}) | ${notes}`.trim();
    onConfirm(countedCash, fullNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-stone-900 px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-bold">Cuadre e Arqueo de Caja</h3>
            <p className="text-xs text-stone-400">Verificación independiente por método de pago</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[82vh] overflow-y-auto p-5 space-y-4">

          {/* Arqueo Efectivo */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">1. Arqueo en Efectivo Físico</span>
              {renderBadge(diffCash, 'Efectivo')}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Fondo Inicial ({money(initial)}) + Ventas Efectivo ({money(cashSales)}):</span>
              <strong className="text-amber-900 font-bold">{money(expectedCash)}</strong>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Monto en Efectivo Físico Contado:</label>
              <input
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-right text-base font-bold text-stone-800 outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Arqueo QR */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">2. Arqueo Pago QR</span>
              {renderBadge(diffQr, 'QR')}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Ventas QR Registradas en Sistema:</span>
              <strong className="text-blue-900 font-bold">{money(expectedQr)}</strong>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Monto Verificado en Banco/Comprobantes QR:</label>
              <input
                type="number"
                value={countedQr}
                onChange={(e) => setCountedQr(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-right text-base font-bold text-stone-800 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Arqueo Tarjeta */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900">3. Arqueo Tarjeta de Crédito/Débito</span>
              {renderBadge(diffCard, 'Tarjeta')}
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Ventas Tarjeta Registradas en Sistema:</span>
              <strong className="text-purple-900 font-bold">{money(expectedCard)}</strong>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">Monto en Vouchers Posnet/POS:</label>
              <input
                type="number"
                value={countedCard}
                onChange={(e) => setCountedCard(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-right text-base font-bold text-stone-800 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Observaciones / Justificación de Arqueo:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Faltante de Bs. 5 por cambio en efectivo..."
              rows={2}
              className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-stone-400"
            />
          </div>

          <button
            onClick={handleConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-black"
          >
            Confirmar Arqueo e Imprimir Cierre de Caja
          </button>
        </div>
      </div>
    </div>
  );
}

function PayModal({ order, onClose, onConfirm, onPrint }: { order: Order; onClose: () => void; onConfirm: (payments: PaymentSplit[]) => void; onPrint: (orderId: string) => void }) {
  const [docType, setDocType] = useState('Nota de Venta (Sin Factura)');
  const [clientName, setClientName] = useState('Público en General');
  const [payMode, setPayMode] = useState<'efectivo' | 'qr' | 'tarjeta' | 'mixto'>('efectivo');

  // Mixto amounts
  const [cashAmount, setCashAmount] = useState<number>(payMode === 'efectivo' ? order.total : 0);
  const [qrAmount, setQrAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [tenderedAmount, setTenderedAmount] = useState<number>(order.total);
  const [showSummary, setShowSummary] = useState(false);
  const [paid, setPaid] = useState(false);

  const totalMixtoEntered = cashAmount + qrAmount + cardAmount;
  const isMixtoValid = payMode === 'mixto' ? Math.abs(totalMixtoEntered - order.total) < 0.01 : true;
  const changeAmount = payMode === 'efectivo' ? Math.max(0, tenderedAmount - order.total) : 0;
  const isCashInsufficient = payMode === 'efectivo' && tenderedAmount < order.total;

  const selectMode = (mode: 'efectivo' | 'qr' | 'tarjeta' | 'mixto') => {
    setPayMode(mode);
    if (mode === 'efectivo') {
      setCashAmount(order.total);
      setQrAmount(0);
      setCardAmount(0);
      setTenderedAmount(order.total);
    } else if (mode === 'qr') {
      setCashAmount(0);
      setQrAmount(order.total);
      setCardAmount(0);
    } else if (mode === 'tarjeta') {
      setCashAmount(0);
      setQrAmount(0);
      setCardAmount(order.total);
    } else if (mode === 'mixto') {
      const half = Math.floor(order.total / 2);
      setCashAmount(half);
      setQrAmount(order.total - half);
      setCardAmount(0);
    }
  };

  const getFinalPayments = (): PaymentSplit[] => {
    if (payMode === 'efectivo') return [{ method: 'efectivo', amount: order.total }];
    if (payMode === 'qr') return [{ method: 'qr', amount: order.total }];
    if (payMode === 'tarjeta') return [{ method: 'tarjeta', amount: order.total }];
    const splits: PaymentSplit[] = [];
    if (cashAmount > 0) splits.push({ method: 'efectivo', amount: cashAmount });
    if (qrAmount > 0) splits.push({ method: 'qr', amount: qrAmount });
    if (cardAmount > 0) splits.push({ method: 'tarjeta', amount: cardAmount });
    return splits.length > 0 ? splits : [{ method: 'efectivo', amount: order.total }];
  };

  const billPresets = [
    { label: 'Exacto', value: order.total },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
  ].filter((b) => b.label === 'Exacto' || b.value >= order.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-stone-900 px-5 py-4 text-white">
          <div>
            <h3 className="text-lg font-bold">Resumen de Cobro</h3>
            <p className="text-xs text-stone-400 mt-0.5">{order.ticket} · {destLabel(order.destination, [])}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[82vh] overflow-y-auto p-5 space-y-4">
          {/* Document Type & Client Name */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Tipo de Documento</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-800 outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option value="Nota de Venta (Sin Factura)">Nota de Venta (Sin Factura)</option>
                <option value="Factura con NIT/CI">Factura con NIT/CI</option>
                <option value="Ticket Interno de Comanda">Ticket Interno de Comanda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre del Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs font-semibold text-stone-800 outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Método de Pago</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => selectMode('efectivo')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'efectivo'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base font-bold">$</span>
                <span className="text-[11px] font-bold mt-0.5">Efectivo</span>
              </button>
              <button
                onClick={() => selectMode('qr')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'qr'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base">📱</span>
                <span className="text-[11px] font-bold mt-0.5">QR</span>
              </button>
              <button
                onClick={() => selectMode('tarjeta')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'tarjeta'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base">💳</span>
                <span className="text-[11px] font-bold mt-0.5">Tarjeta</span>
              </button>
              <button
                onClick={() => selectMode('mixto')}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 px-2 transition-all ${
                  payMode === 'mixto'
                    ? 'border-teal-600 bg-teal-600 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <span className="text-base">💼</span>
                <span className="text-[11px] font-bold mt-0.5">Mixto</span>
              </button>
            </div>
          </div>

          {/* Cash details */}
          {payMode === 'efectivo' && (
            <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/40 p-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Monto Entregado por Cliente (Paga con):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">Bs.</span>
                  <input
                    type="number"
                    value={tenderedAmount || ''}
                    onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-base font-bold text-stone-800 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {billPresets.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => setTenderedAmount(b.value)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                      tenderedAmount === b.value
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {b.label === 'Exacto' ? 'Exacto' : `Bs. ${b.value}`}
                  </button>
                ))}
              </div>

              <div className={`rounded-xl border p-2.5 text-center ${
                isCashInsufficient ? 'border-red-200 bg-red-50 text-red-700' : 'border-teal-200 bg-teal-100/80 text-teal-900'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  {isCashInsufficient ? 'Monto Insuficiente' : 'Cambio / Vuelto a Entregar'}
                </p>
                <p className={`text-xl font-black ${isCashInsufficient ? 'text-red-600' : 'text-teal-800'}`}>
                  {money(changeAmount)}
                </p>
              </div>
            </div>
          )}

          {/* DESGLOSE DE PAGO MIXTO Container (Exact Screenshot 2 styling) */}
          {payMode === 'mixto' && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-600">DESGLOSE DE PAGO MIXTO</p>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Monto en Efectivo</label>
                <input
                  type="number"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-right text-sm font-mono font-bold text-stone-800 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Monto en QR</label>
                <input
                  type="number"
                  value={qrAmount || ''}
                  onChange={(e) => setQrAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-right text-sm font-mono font-bold text-stone-800 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Monto en Tarjeta</label>
                <input
                  type="number"
                  value={cardAmount || ''}
                  onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-right text-sm font-mono font-bold text-stone-800 outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-stone-200">
                <span className="text-stone-600">Total Ingresado:</span>
                <span className={isMixtoValid ? 'text-teal-700' : 'text-red-600'}>
                  {money(totalMixtoEntered)} / {money(order.total)}
                </span>
              </div>
            </div>
          )}

          {/* Subtotal and Total Banner */}
          <div className="pt-3 border-t border-stone-200 space-y-1">
            <div className="flex justify-between text-xs font-semibold text-stone-500">
              <span>Subtotal:</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-base font-extrabold text-stone-800">
              <span>Total:</span>
              <span className="text-2xl text-teal-600 font-black">{money(order.total)}</span>
            </div>
          </div>

          {/* Actions or Live Ticket Preview */}
          {!paid ? (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setPaid(true);
                  onConfirm(getFinalPayments());
                  onPrint(order.id);
                }}
                disabled={!isMixtoValid || isCashInsufficient}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="h-4 w-4" /> Completar Venta e Imprimir Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-center">
                <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> ¡Venta Registrada Exitosamente!
                </p>
              </div>

              {/* Live Thermal Receipt Preview */}
              <div className="rounded-xl border border-stone-300 bg-amber-50/40 p-4 shadow-inner text-stone-900 font-mono text-xs space-y-2">
                <div className="text-center border-b border-dashed border-stone-400 pb-2">
                  <p className="font-extrabold text-sm text-stone-900 uppercase">NostraBar</p>
                  <p className="text-[10px] text-stone-500">Cafetería de Especialidad</p>
                  <p className="font-bold text-stone-800 text-xs mt-1">{order.ticket}</p>
                  <p className="text-[10px] text-stone-600">{docType} · {clientName}</p>
                  <p className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                </div>

                <div className="space-y-1 py-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-[11px]">
                      <div>
                        <span>{item.qty}x {item.name}</span>
                        {item.modifiers.length > 0 && <p className="text-[9px] text-amber-800">({item.modifiers.join(', ')})</p>}
                        {item.extras.map((e) => (
                          <p key={e.id} className="text-[9px] text-stone-500"> + {e.name} ({money(e.price)})</p>
                        ))}
                      </div>
                      <span className="font-bold">{money((item.price + item.extras.reduce((s, e) => s + e.price * e.qty, 0)) * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-stone-400 pt-2 space-y-0.5 text-[11px]">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{money(order.subtotal)}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-red-600"><span>Descuento:</span><span>-{money(order.discount)}</span></div>}
                  <div className="flex justify-between font-extrabold text-xs text-stone-900 pt-1 border-t border-stone-800">
                    <span>TOTAL COMPRA:</span>
                    <span>{money(order.total)}</span>
                  </div>
                  {payMode === 'efectivo' && changeAmount > 0 && (
                    <div className="flex justify-between text-[10px] text-stone-600 pt-1">
                      <span>Cambio / Vuelto:</span>
                      <span className="font-bold">{money(changeAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-stone-500 pt-2 border-t border-dashed border-stone-300">
                  ¡Gracias por su visita!
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onPrint(order.id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-800 py-3 text-xs font-bold text-white hover:bg-stone-900 shadow-md"
                >
                  <Printer className="h-4 w-4" /> Re-Imprimir Ticket
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white hover:bg-teal-700 shadow-md"
                >
                  ✓ Cerrar Venta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}