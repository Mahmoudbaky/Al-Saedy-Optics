import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import type { ProductCard as ProductCardData } from '@/api';
import { Button, Icon, ImageSlot, Pressable, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

export interface ProductCardProps {
  product: ProductCardData;
  imageHeight?: number;
  /** Shows the category tag next to the price (home grid). */
  showCategory?: boolean;
  /** Shows the filled heart badge and an add-to-cart button (wishlist grid). */
  wishlistMode?: boolean;
  onAddToCart?: (product: ProductCardData) => void;
}

export function ProductCard({ product, imageHeight = 94, showCategory = false, wishlistMode = false, onAddToCart }: ProductCardProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { t, tf, l, n, price } = useLocale();

  return (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.slug } })} accessibilityRole="button">
      <View>
        <ImageSlot
          style={[styles.image, { height: imageHeight }, !product.inStock && styles.imageDimmed]}
          source={product.image ? { uri: product.image } : undefined}
          placeholder={l({ ar: 'نظارة', en: 'Frame' })}
        />
        {product.discountPercent > 0 ? (
          <View style={styles.discountBadge}>
            <Text variant="tiny" color="onNavy" weight="bold">{tf(t.product.discount, { percent: n(product.discountPercent) })}</Text>
          </View>
        ) : null}
        {wishlistMode ? (
          <View style={styles.heartBadge}>
            <Icon name="heart" size={15} color={colors.red} filled />
          </View>
        ) : null}
      </View>
      <Text variant="bodySm" weight="medium" numberOfLines={1}>{l(product.name)}</Text>
      <View style={styles.priceRow}>
        <Text variant="bodySm" weight="bold">{price(product.price)}</Text>
        {!product.inStock ? (
          <Text variant="caption" color="red">{t.product.outOfStock}</Text>
        ) : showCategory ? (
          <Text variant="caption" color="textMuted">{l(product.category.name)}</Text>
        ) : null}
      </View>
      {wishlistMode ? (
        <Button label={t.wishlist.addToCart} variant="navy" size="sm" disabled={!product.inStock} onPress={() => onAddToCart?.(product)} style={styles.addButton} />
      ) : null}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.card,
      padding: 10,
      gap: spacing.sm,
      overflow: 'hidden',
    },
    image: { borderRadius: radius.lg },
    imageDimmed: { opacity: 0.55 },
    discountBadge: {
      position: 'absolute',
      top: 6,
      start: 6,
      backgroundColor: colors.red,
      borderRadius: radius.sm,
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    heartBadge: {
      position: 'absolute',
      top: 6,
      end: 6,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.overlaySurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    addButton: { borderRadius: radius.md },
  });
