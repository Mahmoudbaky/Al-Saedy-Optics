import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomBar, Screen, ScreenScroll } from "@/components/layout";
import {
  Button,
  Card,
  Chip,
  Icon,
  IconButton,
  ImageSlot,
  Pressable,
  SectionLabel,
  Swatch,
  Text,
} from "@/components/ui";
import {
  getProduct,
  getProducts,
  lensAddons,
  relatedProductIds,
  type LensAddonId,
} from "@/data";
import { formatAmount, useLocale } from "@/i18n";
import { useCart, useWishlist } from "@/store";
import {
  radius,
  spacing,
  useTheme,
  useThemedStyles,
  type Palette,
} from "@/theme";

const IMAGE_HEIGHT = 236;

export default function ProductScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tf, l, n, price } = useLocale();
  const cart = useCart();
  const wishlist = useWishlist();

  const product = getProduct(id);
  const [color, setColor] = useState(product?.colors[0] ?? colors.navy);
  const [addons, setAddons] = useState<LensAddonId[]>(["blueLight"]);

  if (!product) return <Redirect href="/(tabs)/categories" />;

  const related = getProducts(relatedProductIds).filter(
    (p) => p.id !== product.id,
  );
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
  const categoryLabel =
    t.categories[product.category === "accessories" ? "all" : product.category];
  const addonLabel: Record<LensAddonId, string> = {
    blueLight: t.product.blueLight,
    antiGlare: t.product.antiGlare,
    thin: t.product.thinLens,
  };

  const toggleAddon = (addonId: LensAddonId) =>
    setAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((a) => a !== addonId)
        : [...prev, addonId],
    );

  const addToCart = () => {
    cart.dispatch({ type: "add", product, color, addons });
    router.push("/(tabs)/cart");
  };

  return (
    <Screen background="surface" edges={[]}>
      <ScreenScroll
        gutter={false}
        gap={0}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.gallery}>
          <ImageSlot
            style={StyleSheet.absoluteFill}
            placeholder={l({ ar: "صورة المنتج", en: "Product image" })}
          />
          <View style={[styles.galleryBar, { top: insets.bottom }]}>
            <IconButton
              icon="back"
              variant="glass"
              onPress={() => router.back()}
              accessibilityLabel={t.common.back}
            />
            <IconButton
              icon="heart"
              variant="glass"
              color={colors.red}
              filled={wishlist.has(product.id)}
              onPress={() => wishlist.toggle(product.id)}
              accessibilityLabel={t.wishlist.title}
            />
          </View>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleBlock}>
            <Text variant="label" color="textSecondary">
              {[product.brand ? l(product.brand) : null, categoryLabel]
                .filter(Boolean)
                .join(" · ")}
            </Text>
            <Text variant="title">
              {product.code
                ? `${l(product.name)} — ${product.code}`
                : l(product.name)}
            </Text>
            <View style={styles.priceRow}>
              <Text variant="price">{price(product.price)}</Text>
              {product.compareAtPrice ? (
                <Text variant="bodySm" color="textMuted" style={styles.strike}>
                  {formatAmount(product.compareAtPrice)}
                </Text>
              ) : null}
              {discount > 0 ? (
                <View style={styles.discount}>
                  <Text variant="caption" color="redDark" weight="bold">
                    {tf(t.product.discount, { percent: n(discount) })}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {product.colors.length > 1 ? (
            <View style={styles.section}>
              <SectionLabel>{t.product.color}</SectionLabel>
              <View style={styles.swatches}>
                {product.colors.map((c) => (
                  <Swatch
                    key={c}
                    color={c}
                    selected={c === color}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <InfoBox label={t.product.size} value={t.product.sizeValue} />
            <InfoBox label={t.product.lenses} value={t.product.lensValue} />
          </View>

          <Card tone="muted" padding={12} style={styles.hint}>
            <Icon name="rxCard" size={20} />
            <Text variant="label" style={styles.hintText}>
              {t.product.rxHint}
            </Text>
          </Card>

          <View style={styles.section}>
            <SectionLabel>{t.product.lensAddons}</SectionLabel>
            <View style={styles.chips}>
              {lensAddons.map((a) => (
                <Chip
                  key={a.id}
                  variant="outlined"
                  label={addonLabel[a.id]}
                  selected={addons.includes(a.id)}
                  onPress={() => toggleAddon(a.id)}
                />
              ))}
            </View>
          </View>

          {related.length ? (
            <View style={styles.section}>
              <SectionLabel>{t.product.youMayLike}</SectionLabel>
              <View style={styles.related}>
                {related.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.relatedItem}
                    onPress={() =>
                      router.push({
                        pathname: "/product/[id]",
                        params: { id: p.id },
                      })
                    }
                    accessibilityRole="button"
                  >
                    <ImageSlot
                      style={styles.relatedImage}
                      placeholder={l({
                        ar: p.category === "accessories" ? "علبة" : "نظارة",
                        en: p.category === "accessories" ? "Case" : "Frame",
                      })}
                    />
                    <Text
                      variant="label"
                      numberOfLines={1}
                    >{`${p.code ?? l(p.name)} · ${formatAmount(p.price)}`}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScreenScroll>

      <BottomBar bordered background="surface">
        <IconButton
          icon="glasses"
          variant="outline"
          shape="rounded"
          size={56}
          iconSize={24}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/try-on",
              params: { product: product.id },
            })
          }
          accessibilityLabel={t.tryOn.title}
        />
        <Button
          label={t.product.addToCart}
          style={styles.addButton}
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
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Text variant="bodySm" weight="medium">
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    scroll: { paddingBottom: spacing.lg },
    gallery: { height: IMAGE_HEIGHT, backgroundColor: colors.surfaceMuted },
    galleryBar: {
      position: "absolute",
      left: spacing.screen,
      right: spacing.screen,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    dots: {
      position: "absolute",
      bottom: 14,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.borderStrong,
    },
    dotActive: { width: 18, backgroundColor: colors.navy },
    body: { padding: spacing.screen, gap: 14 },
    titleBlock: { gap: 6 },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    strike: { textDecorationLine: "line-through" },
    discount: {
      backgroundColor: colors.redSoft,
      borderRadius: radius.sm,
      paddingVertical: 4,
      paddingHorizontal: 9,
    },
    section: { gap: 9 },
    swatches: { flexDirection: "row", gap: 10 },
    infoRow: { flexDirection: "row", gap: 10 },
    infoBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.xl,
      padding: 12,
      gap: 3,
    },
    hint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: radius.xl,
      paddingHorizontal: 14,
    },
    hintText: { flex: 1 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    related: { flexDirection: "row", gap: 10 },
    relatedItem: { flex: 1, gap: 6 },
    relatedImage: { height: 74, borderRadius: radius.lg },
    addButton: { flex: 1 },
  });
