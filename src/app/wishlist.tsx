import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useApiErrorMessage, useCart, useWishlistProducts } from '@/api';
import { RequireAuth, useAuth } from '@/auth';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { Text } from '@/components/ui';
import { useLocale } from '@/i18n';

export default function WishlistScreen() {
  const { t, tf, n } = useLocale();
  const { user } = useAuth();
  const wishlist = useWishlistProducts();
  const count = user && wishlist.data ? <Text variant="label" color="textSecondary">{tf(t.wishlist.count, { count: n(wishlist.data.length) })}</Text> : undefined;

  return (
    <Screen>
      <ScreenHeader showBack size="lg" title={t.wishlist.title} trailing={count} />
      <RequireAuth>
        <WishlistBody />
      </RequireAuth>
    </Screen>
  );
}

function WishlistBody() {
  const router = useRouter();
  const { t } = useLocale();
  const wishlist = useWishlistProducts();
  const cart = useCart();
  const errorMessage = useApiErrorMessage();
  const products = wishlist.data ?? [];

  if (wishlist.isPending) return <LoadingView />;
  if (wishlist.isError) return <ErrorView error={wishlist.error} onRetry={() => wishlist.refetch()} />;
  if (products.length === 0) {
    return <EmptyView icon="heart" title={t.wishlist.empty} action={{ label: t.cart.browse, onPress: () => router.push('/(tabs)/categories') }} />;
  }

  return (
    <ScreenScroll>
      <ProductGrid
        products={products}
        imageHeight={100}
        wishlistMode
        onAddToCart={(product) =>
          cart
            .addItem({ productId: product.id })
            .then(() => Alert.alert(t.product.addedToCart))
            .catch((err) => Alert.alert(errorMessage(err)))
        }
      />
    </ScreenScroll>
  );
}
