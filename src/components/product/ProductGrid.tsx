import { StyleSheet, View } from 'react-native';

import type { Product } from '@/data';
import { spacing } from '@/theme';

import { ProductCard, type ProductCardProps } from './ProductCard';

export interface ProductGridProps extends Omit<ProductCardProps, 'product'> {
  products: readonly Product[];
}

/** Two-column grid; rows are built explicitly so the last odd card keeps its width. */
export function ProductGrid({ products, ...cardProps }: ProductGridProps) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));

  return (
    <View style={styles.grid}>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((p) => <ProductCard key={p.id} product={p} {...cardProps} />)}
          {row.length === 1 ? <View style={styles.spacer} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  spacer: { flex: 1 },
});
