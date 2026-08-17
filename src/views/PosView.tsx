import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import type { Order, OrderItemExtra, Product } from '@/types';

import { ReadyAlerts } from '@/views/pos/ReadyAlerts';
import { TablesView } from '@/views/pos/TablesView';
import { OrderDetailView } from '@/views/pos/OrderDetailView';
import { PreviewView } from '@/views/pos/PreviewView';
import { CatalogView } from '@/views/pos/CatalogView';
import { ComandaPanel } from '@/views/pos/ComandaPanel';
import { ModifierModal } from '@/views/pos/modals/ModifierModal';
import { ExtrasModal } from '@/views/pos/modals/ExtrasModal';
import { OpenCashModal } from '@/views/pos/modals/OpenCashModal';
import { CloseCashModal } from '@/views/pos/modals/CloseCashModal';
import { TransferTableModal } from '@/views/pos/modals/TransferTableModal';
import { PayModal } from '@/views/pos/modals/PayModal';

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
    changeQty,
    removeItem,
    setItemNote,
    discount,
    setDiscount,
    sendToKitchen,
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

  const [viewMode, setViewMode] = useState<'tables' | 'catalog' | 'orderDetail' | 'preview'>('tables');
  const [modifierPicker, setModifierPicker] = useState<Product | null>(null);
  const [extrasPicker, setExtrasPicker] = useState<Product | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([]);
  const [pendingMods, setPendingMods] = useState<string[]>([]);
  const [payModal, setPayModal] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  const [isCashOpenModal, setIsCashOpenModal] = useState(false);
  const [isCashCloseModal, setIsCashCloseModal] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [, setCountedCashInput] = useState<number>(0);

  const isMesero = role === 'mesero';
  const isCajero = role === 'cajero';
  const showTables = isMesero || isCajero;

  const activeOrder = useMemo(() => {
    if (activeDestination.type === 'mesa') return getOrderForTable(activeDestination.tableId) || null;
    if (activeDestination.type === 'barra') return orders.find((o) => o.destination.type === 'barra' && !o.paid) || null;
    if (activeDestination.type === 'llevar') return orders.find((o) => o.destination.type === 'llevar' && !o.paid) || null;
    return null;
  }, [activeDestination, orders, getOrderForTable]);

  const occupiedTableIds = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => { if (o.destination.type === 'mesa' && !o.paid) set.add(o.destination.tableId); });
    return set;
  }, [orders]);

  const subtotal = useMemo(() => {
    return activeItems.reduce((s, i) => {
      const extrasTotal = i.extras.reduce((es, e) => es + e.price * e.qty, 0);
      return s + (i.price + extrasTotal) * i.qty;
    }, 0);
  }, [activeItems]);
  const total = Math.max(0, subtotal - discount);

  const activeReadyAlerts = useMemo(() => {
    return readyAlerts.map((key) => {
      const tableId = key.replace('mesa', '');
      const table = tables.find((t) => t.id === tableId);
      const order = orders.find((o) => o.destination.type === 'mesa' && o.destination.tableId === tableId && !o.paid);
      return { key, table, order };
    }).filter((a) => a.table && a.order);
  }, [readyAlerts, tables, orders]);

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
    setViewMode(existingOrder ? 'orderDetail' : 'catalog');
  };

  const handleBarraSelect = () => {
    setActiveDestination({ type: 'barra' });
    const barraOrder = orders.find((o) => o.destination.type === 'barra' && !o.paid);
    setViewMode(barraOrder ? 'orderDetail' : 'catalog');
  };

  const handleLlevarSelect = () => {
    setActiveDestination({ type: 'llevar' });
    const llevarOrder = orders.find((o) => o.destination.type === 'llevar' && !o.paid);
    setViewMode(llevarOrder ? 'orderDetail' : 'catalog');
  };

  const handleSendToKitchen = async () => {
    await sendToKitchen();
    if (showTables) setViewMode('tables');
  };

  const showCatalog = !showTables || viewMode === 'catalog';
  const showOrderDetail = showTables && viewMode === 'orderDetail' && activeOrder;
  const showPreview = viewMode === 'preview';

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col bg-stone-100 lg:flex-row">
      <ReadyAlerts
        alerts={activeReadyAlerts}
        onRecoger={(tableId, key) => { handleTableSelect(tableId); dismissReadyAlert(key); }}
        onDismiss={(key) => dismissReadyAlert(key)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {showTables && viewMode === 'tables' && (
          <TablesView
            tables={tables}
            orders={orders}
            occupiedTableIds={occupiedTableIds}
            isCajero={isCajero}
            onTableSelect={handleTableSelect}
            onBarraSelect={handleBarraSelect}
            onLlevarSelect={handleLlevarSelect}
          />
        )}

        {showOrderDetail && activeOrder && (
          <OrderDetailView
            activeOrder={activeOrder}
            activeDestination={activeDestination}
            tables={tables}
            isCajero={isCajero}
            onBack={() => setViewMode('tables')}
            onAddItems={() => setViewMode('catalog')}
            onTransfer={() => setIsTransferModalOpen(true)}
            onPay={(order) => { setPayingOrder(order); setPayModal(true); }}
          />
        )}

        {showPreview && (
          <PreviewView
            activeItems={activeItems}
            total={total}
            onBack={() => setViewMode('catalog')}
            onSendToKitchen={handleSendToKitchen}
          />
        )}

        {showCatalog && (
          <CatalogView
            showTables={showTables}
            isCajero={isCajero}
            activeDestination={activeDestination}
            activeOrder={activeOrder}
            tables={tables}
            products={products}
            transactions={transactions}
            activeCashRegister={activeCashRegister}
            onClose={() => setViewMode('tables')}
            onSetDestination={setActiveDestination}
            onProductClick={handleProductClick}
            onSetPayModal={(show, order) => { if (order) setPayingOrder(order); setPayModal(show); }}
            onSetIsCashOpenModal={setIsCashOpenModal}
            onSetIsCashCloseModal={setIsCashCloseModal}
            onSetCountedCashInput={setCountedCashInput}
          />
        )}
      </div>

      {showCatalog && (
        <ComandaPanel
          activeItems={activeItems}
          activeDestination={activeDestination}
          activeOrder={activeOrder}
          tables={tables}
          subtotal={subtotal}
          total={total}
          discount={discount}
          isCajero={isCajero}
          onSetDiscount={setDiscount}
          onChangeQty={changeQty}
          onRemoveItem={removeItem}
          onSetItemNote={setItemNote}
          onSetViewMode={(mode) => setViewMode(mode)}
          onSendToKitchen={handleSendToKitchen}
          onSetPayModal={(show) => setPayModal(show)}
        />
      )}

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
