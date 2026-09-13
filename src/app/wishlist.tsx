import { StyleSheet, View } from 'react-native';

import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { Icon, Text } from '@/components/ui';
import { getProducts } from '@/data';
import { useLocale } from '@/i18n';
import { useCart, useWishlist } from '@/store';
import { spacing, useTheme } from '@/theme';

export default function WishlistScreen() {
  const { colors } = useTheme();
  const { t, tf, n } = useLocale();
  const wishlist = useWishlist();
  const cart = useCart();
  const products = getProducts(wishlist.ids);

  return (
    <Screen>
      <ScreenHeader showBack size="lg" title={t.wishlist.title} trailing={<Text variant="label" color="textSecondary">{tf(t.wishlist.count, { count: n(products.length) })}</Text>} />
      {products.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="heart" size={44} color={colors.textMuted} strokeWidth={1.4} />
          <Text variant="bodySm" color="textSecondary" align="center">{t.wishlist.empty}</Text>
        </View>
      ) : (
        <ScreenScroll>
          <ProductGrid products={products} imageHeight={100} wishlistMode onAddToCart={(product) => cart.dispatch({ type: 'add', product })} />
        </ScreenScroll>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingBottom: 80 },
});
