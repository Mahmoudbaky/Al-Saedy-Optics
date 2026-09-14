import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { useApiErrorMessage, useCart, useProduct, type Cart } from "@/api";
import { RequireAuth } from "@/auth";
import { CartLineCard, OrderSummaryCard } from "@/components/cart";
import { EmptyView, ErrorView, LoadingView } from "@/components/feedback";
import { Screen, ScreenHeader, ScreenScroll } from "@/components/layout";
import {
  Button,
  Card,
  Icon,
  Pressable,
  Text,
  TextField,
} from "@/components/ui";
import { useLocale } from "@/i18n";
import { radius, spacing, useThemedStyles, type Palette } from "@/theme";

const UPSELL_PRODUCT_SLUG = "cleaning-kit-spray";

export default function CartScreen() {
  const { t, tf, n } = useLocale();
  const cart = useCart();
  const count = cart.cart ? (
    <Text variant="label" color="textSecondary">
      {tf(t.cart.count, { count: n(cart.itemCount) })}
    </Text>
  ) : undefined;

  return (
    <Screen>
      <ScreenHeader size="lg" title={t.cart.title} trailing={count} />
      <RequireAuth>
        <CartBody />
      </RequireAuth>
    </Screen>
  );
}

function CartBody() {
  const router = useRouter();
  const { t } = useLocale();
  const cart = useCart();

  if (cart.isLoading) return <LoadingView />;
  if (cart.error && !cart.cart)
    return <ErrorView error={cart.error} onRetry={() => cart.refetch()} />;
  if (!cart.cart || cart.cart.items.length === 0) {
    return (
      <EmptyView
        icon="bag"
        title={t.cart.empty}
        hint={t.cart.emptyHint}
        action={{
          label: t.cart.browse,
          onPress: () => router.push("/(tabs)/categories"),
        }}
      />
    );
  }
  return <CartContent cart={cart.cart} />;
}

function CartContent({ cart: data }: { cart: Cart }) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { t, tf, n, price } = useLocale();
  const cart = useCart();
  const errorMessage = useApiErrorMessage();
  const [promo, setPromo] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);

  const upsell = useProduct(UPSELL_PRODUCT_SLUG);
  const showUpsell =
    upsell.data && upsell.data.inStock && !cart.has(upsell.data.id);

  const { summary, prescription, requiresPrescription } = data;
  console.log(prescription, requiresPrescription);
  const hasUnavailable = data.items.some((i) => !i.available);
  const missingRx = requiresPrescription && !prescription;
  const untilFreeDelivery =
    summary.freeDeliveryThreshold - (summary.subtotal - summary.discount);

  const run = async (itemId: string, action: () => Promise<unknown>) => {
    setBusyItem(itemId);
    try {
      await action();
    } catch (err) {
      // Stock / availability problems come back as 400s with a readable message.
      Alert.alert(errorMessage(err));
    } finally {
      setBusyItem(null);
    }
  };

  const applyPromo = async (code: string | null) => {
    setPromoError(null);
    try {
      await cart.applyPromo(code);
      if (!code) setPromo("");
    } catch (err) {
      setPromoError(errorMessage(err));
    }
  };

  const rows = [
    { label: t.common.subtotal, value: price(summary.subtotal) },
    ...(summary.discount > 0
      ? [
          {
            label: t.cart.discount,
            value: `− ${price(summary.discount)}`,
            valueColor: "green" as const,
          },
        ]
      : []),
    {
      label: t.common.delivery,
      value:
        summary.deliveryFee === 0 ? t.common.free : price(summary.deliveryFee),
      valueColor:
        summary.deliveryFee === 0 ? ("green" as const) : ("text" as const),
    },
  ];

  return (
    <ScreenScroll gap={spacing.md}>
      {data.items.map((item) => (
        <CartLineCard
          key={item.id}
          item={item}
          busy={busyItem === item.id}
          onQuantityChange={(quantity) =>
            run(item.id, () => cart.setQuantity(item.id, quantity))
          }
          onRemove={() => run(item.id, () => cart.removeItem(item.id))}
        />
      ))}

      {data.promo.code ? (
        <Card style={styles.rowCard} padding={13}>
          <Icon name="tag" size={20} />
          <View style={styles.rowBody}>
            <Text variant="label">
              {tf(t.cart.promoApplied, { code: data.promo.code })}
            </Text>
            {data.promo.error ? (
              <Text variant="caption" color="red">
                {data.promo.error}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => applyPromo(null)}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text variant="label" color="red">
              {t.common.remove}
            </Text>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.promoRow}>
          <TextField
            value={promo}
            onChangeText={(v) => setPromo(v.toUpperCase())}
            placeholder={t.cart.promoPlaceholder}
            error={promoError}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.promoInput}
            returnKeyType="done"
            onSubmitEditing={() => promo && applyPromo(promo)}
          />
          <Button
            label={t.common.apply}
            variant="navy"
            size="md"
            style={styles.promoButton}
            disabled={!promo || cart.pending.promo}
            onPress={() => applyPromo(promo)}
          />
        </View>
      )}

      {requiresPrescription ? (
        <Pressable
          onPress={() => router.push("/prescription")}
          accessibilityRole="button"
        >
          <Card style={styles.rowCard}>
            <View style={styles.iconBox}>
              <Icon name="bookmark" size={19} />
            </View>
            <View style={styles.rowBody}>
              <Text variant="bodySm" weight="medium">
                {prescription ? t.cart.rxAttached : t.cart.rxMissing}
              </Text>
              {prescription ? (
                <Text variant="caption" color="textSecondary">
                  {n(
                    `OD ${prescription.od.sph ?? "—"} · OS ${prescription.os.sph ?? "—"} · PD ${prescription.pd ?? "—"}`,
                  )}
                </Text>
              ) : (
                <Text variant="caption" color="red">
                  {t.cart.rxRequiredHint}
                </Text>
              )}
            </View>
            <Text variant="label" color="red">
              {prescription ? t.common.change : t.common.add}
            </Text>
          </Card>
        </Pressable>
      ) : null}

      {showUpsell ? (
        <Card style={styles.rowCard} padding={13}>
          <Icon name="card" size={20} />
          <View style={styles.rowBody}>
            <Text variant="label">
              {tf(t.cart.upsell, { price: price(upsell.data.price) })}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              run(upsell.data.id, () =>
                cart.addItem({ productId: upsell.data.id }),
              )
            }
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text variant="label" weight="bold">
              {t.common.add}
            </Text>
          </Pressable>
        </Card>
      ) : null}

      {untilFreeDelivery > 0 && summary.deliveryFee > 0 ? (
        <Text variant="caption" color="textSecondary" align="center">
          {tf(t.cart.freeDeliveryHint, { amount: price(untilFreeDelivery) })}
        </Text>
      ) : null}

      <OrderSummaryCard
        rows={rows}
        totalLabel={t.common.total}
        totalValue={price(summary.total)}
      />

      {hasUnavailable ? (
        <Text variant="caption" color="red" align="center">
          {t.errors.itemsUnavailable}
        </Text>
      ) : null}
      <Button
        label={t.cart.checkout}
        disabled={hasUnavailable || missingRx || summary.itemCount === 0}
        onPress={() => router.push("/checkout")}
      />
    </ScreenScroll>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    promoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    promoInput: { flex: 1 },
    promoButton: {
      paddingHorizontal: 20,
      borderRadius: radius.lg,
      minHeight: 48,
    },
    rowCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    rowBody: { flex: 1, gap: 2 },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
  });
