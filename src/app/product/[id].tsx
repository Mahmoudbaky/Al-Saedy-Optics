import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApiErrorMessage, useCart, useLensAddons, useProduct, useWishlist, type ProductDetail } from '@/api';
import { useAuth } from '@/auth';
import { ErrorView, LoadingView } from '@/components/feedback';
import { BottomBar, Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { Button, Card, Chip, ChipRow, Icon, IconButton, ImageSlot, Pressable, SectionLabel, Swatch, Text } from '@/components/ui';
import { formatAmount, useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

const IMAGE_HEIGHT = 236;

/** Dioptre steps offered for products sold by power (contact lenses, ready readers). */
function powerOptions(product: ProductDetail): string[] {
  const range = (from: number, to: number) => {
    const out: string[] = [];
    for (let v = from; v <= to + 1e-9; v += 0.25) out.push((v > 0 ? '+' : '') + v.toFixed(2));
    return out;
  };
  if (product.category.slug === 'contact') return ['0.00', ...range(-6, -0.25).reverse(), ...range(0.25, 4)];
  if (product.slug.startsWith('reading')) return range(1, 3);
  return [];
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);

  if (product.isPending) {
    return (
      <Screen>
        <ScreenHeader showBack />
        <LoadingView />
      </Screen>
    );
  }
  if (product.isError) {
    return (
      <Screen>
        <ScreenHeader showBack />
        <ErrorView error={product.error} onRetry={() => product.refetch()} />
      </Screen>
    );
  }
  return <ProductView key={product.data.id} product={product.data} />;
}

function ProductView({ product }: { product: ProductDetail }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, tf, l, n, price } = useLocale();
  const { user } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const lensAddons = useLensAddons();
  const errorMessage = useApiErrorMessage();

  const variants = product.variants.filter((v) => v.isActive);
  const [variantId, setVariantId] = useState(() => (variants.find((v) => v.inStock) ?? variants[0])?.id);
  const variant = variants.find((v) => v.id === variantId);
  const [addons, setAddons] = useState<string[]>([]);
  const powers = powerOptions(product);
  const [power, setPower] = useState<string | null>(null);

  const addonOptions = product.supportsLensAddons ? (lensAddons.data ?? []).filter((a) => a.isActive) : [];
  const addonTotal = addonOptions.filter((a) => addons.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  const image = variant?.images[0] ?? product.images[0]?.url ?? product.image;
  const specs = product.specs;
  const size = specs?.lensWidth && specs.bridge && specs.templeLength ? `${specs.lensWidth}-${specs.bridge}-${specs.templeLength}` : null;

  const toggleAddon = (addonId: string) => setAddons((prev) => (prev.includes(addonId) ? prev.filter((a) => a !== addonId) : [...prev, addonId]));
  const requireSignIn = () => router.push('/(auth)/sign-in');

  const toggleWishlist = () => {
    if (!user) return requireSignIn();
    wishlist.toggle(product.id).catch((err) => Alert.alert(errorMessage(err)));
  };

  const addToCart = async () => {
    if (!user) return requireSignIn();
    if (powers.length && !power) return Alert.alert(t.product.selectPower);
    try {
      await cart.addItem({ productId: product.id, variantId: variant?.id, addonIds: addons, variantLabel: power ?? undefined });
      Alert.alert(t.product.addedToCart, undefined, [
        { text: t.product.continueShopping, style: 'cancel' },
        { text: t.product.goToCart, onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch (err) {
      Alert.alert(errorMessage(err));
    }
  };

  const canAdd = product.inStock && (!variant || variant.inStock) && !cart.pending.add;

  return (
    <Screen background="surface" edges={[]}>
      <ScreenScroll gutter={false} gap={0} contentContainerStyle={styles.scroll}>
        <View style={styles.gallery}>
          <ImageSlot style={StyleSheet.absoluteFill} source={image ? { uri: image } : undefined} placeholder={l({ ar: 'صورة المنتج', en: 'Product image' })} />
          <View style={[styles.galleryBar, { top: Math.max(insets.top, spacing.md) }]}>
            <IconButton icon="back" variant="glass" onPress={() => router.back()} accessibilityLabel={t.common.back} />
            <IconButton icon="heart" variant="glass" color={colors.red} filled={wishlist.has(product.id)} onPress={toggleWishlist} accessibilityLabel={t.wishlist.title} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleBlock}>
            <Text variant="label" color="textSecondary">
              {[product.brand ? l(product.brand.name) : null, l(product.category.name)].filter(Boolean).join(' · ')}
            </Text>
            <Text variant="title">{product.code ? `${l(product.name)} — ${product.code}` : l(product.name)}</Text>
            <View style={styles.priceRow}>
              <Text variant="price">{price(product.price)}</Text>
              {product.compareAtPrice ? (
                <Text variant="bodySm" color="textMuted" style={styles.strike}>{formatAmount(product.compareAtPrice)}</Text>
              ) : null}
              {product.discountPercent > 0 ? (
                <View style={styles.discount}>
                  <Text variant="caption" color="redDark" weight="bold">{tf(t.product.discount, { percent: n(product.discountPercent) })}</Text>
                </View>
              ) : null}
            </View>
            {product.rating.count > 0 ? (
              <Text variant="caption" color="textSecondary">{`★ ${n(product.rating.average.toFixed(1))} · ${tf(t.product.reviews, { count: n(product.rating.count) })}`}</Text>
            ) : null}
            {product.note ? <Text variant="caption" color="textSecondary">{l(product.note)}</Text> : null}
          </View>

          {variants.length > 1 ? (
            <View style={styles.section}>
              <SectionLabel>{`${t.product.color}${variant?.colorName ? ` · ${l(variant.colorName)}` : ''}`}</SectionLabel>
              <View style={styles.swatches}>
                {variants.map((v) => (
                  <Swatch key={v.id} color={v.colorHex} selected={v.id === variantId} disabled={!v.inStock} onPress={() => setVariantId(v.id)} />
                ))}
              </View>
            </View>
          ) : null}

          {powers.length ? (
            <View style={styles.section}>
              <SectionLabel>{t.product.power}</SectionLabel>
              <ChipRow>
                {powers.map((p) => (
                  <Chip key={p} variant="outlined" label={n(p)} selected={p === power} onPress={() => setPower(p)} />
                ))}
              </ChipRow>
              <Text variant="caption" color="textMuted">{t.product.powerHint}</Text>
            </View>
          ) : null}

          {size || specs?.material ? (
            <View style={styles.infoRow}>
              {size ? <InfoBox label={t.product.size} value={n(size)} /> : null}
              {specs?.material ? (
                <InfoBox label={t.product.material} value={specs.weightGrams ? `${specs.material} · ${tf(t.product.weight, { grams: n(specs.weightGrams) })}` : specs.material} />
              ) : null}
            </View>
          ) : null}

          {product.description ? <Text variant="bodySm" color="textSecondary">{l(product.description)}</Text> : null}

          {product.requiresPrescription ? (
            <Card tone="muted" padding={12} style={styles.hint}>
              <Icon name="rxCard" size={20} />
              <Text variant="label" style={styles.hintText}>{t.product.rxHint}</Text>
            </Card>
          ) : null}

          {addonOptions.length ? (
            <View style={styles.section}>
              <SectionLabel>{t.product.lensAddons}</SectionLabel>
              <View style={styles.chips}>
                {addonOptions.map((a) => (
                  <Chip key={a.id} variant="outlined" label={`${l(a.name)} +${formatAmount(a.price)}`} selected={addons.includes(a.id)} onPress={() => toggleAddon(a.id)} />
                ))}
              </View>
            </View>
          ) : null}

          {product.related.length ? (
            <View style={styles.section}>
              <SectionLabel>{t.product.youMayLike}</SectionLabel>
              <View style={styles.related}>
                {product.related.slice(0, 3).map((p) => (
                  <Pressable key={p.id} style={styles.relatedItem} onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.slug } })} accessibilityRole="button">
                    <ImageSlot style={styles.relatedImage} source={p.image ? { uri: p.image } : undefined} placeholder={l({ ar: 'نظارة', en: 'Frame' })} />
                    <Text variant="label" numberOfLines={1}>{`${p.code ?? l(p.name)} · ${formatAmount(p.price)}`}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScreenScroll>

      <BottomBar bordered background="surface">
        {product.shape ? (
          <IconButton
            icon="glasses"
            variant="outline"
            shape="rounded"
            size={56}
            iconSize={24}
            onPress={() => router.push({ pathname: '/(tabs)/try-on', params: { product: product.slug } })}
            accessibilityLabel={t.tryOn.title}
          />
        ) : null}
        <Button
          label={canAdd ? `${t.product.addToCart} · ${formatAmount(product.price + addonTotal)}` : t.product.outOfStock}
          style={styles.addButton}
          disabled={!canAdd}
          onPress={addToCart}
        />
      </BottomBar>
    </Screen>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.infoBox}>
      <Text variant="caption" color="textSecondary">{label}</Text>
      <Text variant="bodySm" weight="medium">{value}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    scroll: { paddingBottom: spacing.lg },
    gallery: { height: IMAGE_HEIGHT, backgroundColor: colors.surfaceMuted },
    galleryBar: { position: 'absolute', left: spacing.screen, right: spacing.screen, flexDirection: 'row', justifyContent: 'space-between' },
    body: { padding: spacing.screen, gap: 14 },
    titleBlock: { gap: 6 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    strike: { textDecorationLine: 'line-through' },
    discount: { backgroundColor: colors.redSoft, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: 9 },
    section: { gap: 9 },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    infoRow: { flexDirection: 'row', gap: 10 },
    infoBox: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: 12, gap: 3 },
    hint: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.xl, paddingHorizontal: 14 },
    hintText: { flex: 1 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    related: { flexDirection: 'row', gap: 10 },
    relatedItem: { flex: 1, gap: 6 },
    relatedImage: { height: 74, borderRadius: radius.lg },
    addButton: { flex: 1 },
  });
