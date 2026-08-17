import type { CategoryKey, OrderDestination, Table } from '@/types';

export const money = (n: number) => `Bs. ${n.toLocaleString('es-CO')}`;

export function destLabel(d: OrderDestination, tables?: Table[]): string {
  if (d.type === 'mesa') {
    const table = tables?.find((t) => t.id === d.tableId);
    return table ? table.name : 'Mesa';
  }
  if (d.type === 'barra') return 'Barra';
  return 'Para Llevar';
}

export function getTableName(tables: Table[], tableId: string): string {
  const table = tables.find((t) => t.id === tableId);
  return table ? table.name : `Mesa ${tableId}`;
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
