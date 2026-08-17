import type { Product } from '@/types';

export function emojiFor(p: Product): string {
  if (p.category === 'espresso') return '☕';
  if (p.category === 'filtrados') return '🫖';
  if (p.category === 'frias') return '🧊';
  if (p.category === 'pasteleria') return '🥐';
  return '📦';
}
