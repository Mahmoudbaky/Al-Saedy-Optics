import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApiErrorMessage, useCart, useProduct } from '@/api';
import { useAuth } from '@/auth';
import { Screen } from '@/components/layout';
import { Button, Icon, IconButton, Pressable, Text, type IconName } from '@/components/ui';
import { useLocale } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Palette } from '@/theme';

const DEFAULT_PRODUCT_ID = 'vc-214';

/** Frame styles (product slugs) the user can flip between while the camera is live. */
const frameStyles: { icon: IconName; productId: string }[] = [
  { icon: 'glasses', productId: DEFAULT_PRODUCT_ID },
  { icon: 'sunglasses', productId: 'ray-ban-rb3025-aviator' },
  { icon: 'contacts', productId: 'ray-ban-rb3447-round' },
];

export default function TryOnScreen() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, l, price } = useLocale();
  const { user } = useAuth();
  const cart = useCart();
  const errorMessage = useApiErrorMessage();
  const params = useLocalSearchParams<{ product?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [productId, setProductId] = useState(() => params.product || DEFAULT_PRODUCT_ID);

  const { data: product } = useProduct(productId);
  const canGoBack = router.canGoBack();

  const addToCart = async () => {
    if (!user) return router.push('/(auth)/sign-in');
    if (!product) return;
    try {
      await cart.addItem({ productId: product.id });
      Alert.alert(t.product.addedToCart);
    } catch (err) {
      Alert.alert(errorMessage(err));
    }
  };

  return (
    <Screen background="cameraBackdrop" edges={[]}>
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing={facing} />
      ) : (
        <PermissionPrompt canAsk={permission?.canAskAgain ?? true} onRequest={requestPermission} />
      )}

      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]} pointerEvents="box-none">
        <View style={styles.topBar}>
          {canGoBack ? <IconButton icon="back" variant="glassDark" onPress={() => router.back()} accessibilityLabel={t.common.back} /> : <View style={styles.topSpacer} />}
          <Text variant="body" color="onNavy" weight="bold">{t.tryOn.title}</Text>
          <IconButton icon="expand" variant="glassDark" onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))} accessibilityLabel={t.tryOn.flipCamera} />
        </View>

        <View style={styles.faceGuideArea} pointerEvents="none">
          <View style={styles.faceGuide}>
            <View style={styles.faceHint}>
              <Text variant="label" color="onNavy">{t.tryOn.faceHint}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <View style={styles.frameRow}>
            {frameStyles.map((f) => {
              const selected = f.productId === productId;
              return (
                <Pressable key={f.productId} onPress={() => setProductId(f.productId)} accessibilityRole="radio" accessibilityState={{ selected }} style={[styles.frameThumb, selected && styles.frameThumbSelected]}>
                  <Icon name={f.icon} size={30} color={selected ? colors.onNavy : 'rgba(255,255,255,0.75)'} strokeWidth={1.4} />
                </Pressable>
              );
            })}
            <View style={styles.productInfo}>
              <Text variant="bodySm" color="onNavy" weight="bold" numberOfLines={1}>{product ? (product.code ?? l(product.name)) : '…'}</Text>
              <Text variant="label" style={styles.productPrice}>{product ? price(product.price) : ''}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button label={t.tryOn.addToCart} variant="white" size="md" style={styles.addButton} disabled={!product || cart.pending.add} onPress={addToCart} />
            <Pressable accessibilityRole="button" accessibilityLabel={t.tryOn.capture} style={styles.shutter}>
              <View style={styles.shutterInner} />
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function PermissionPrompt({ canAsk, onRequest }: { canAsk: boolean; onRequest: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useLocale();
  return (
    <View style={styles.permission}>
      <Icon name="glasses" size={40} color={colors.onNavy} strokeWidth={1.4} />
      <Text variant="headline" color="onNavy" align="center">{t.tryOn.permissionTitle}</Text>
      <Text variant="bodySm" color="onNavyMuted" align="center">{canAsk ? t.tryOn.permissionBody : t.tryOn.unavailable}</Text>
      {canAsk ? <Button label={t.tryOn.permissionCta} variant="white" size="md" onPress={onRequest} style={styles.permissionButton} /> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingVertical: 6 },
  topSpacer: { width: 38 },
  faceGuideArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  faceGuide: {
    width: 230,
    height: 290,
    borderRadius: 145,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  faceHint: { backgroundColor: 'rgba(15,22,32,0.55)', borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  bottom: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xl, gap: spacing.lg },
  frameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  frameThumb: { width: 62, height: 62, borderRadius: 16, backgroundColor: colors.white10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  frameThumbSelected: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 2, borderColor: colors.onNavy },
  productInfo: { flex: 1, gap: 2, paddingStart: 6 },
  productPrice: { color: 'rgba(255,255,255,0.7)' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addButton: { flex: 1 },
  shutter: { width: 54, height: 54, borderRadius: 27, borderWidth: 3, borderColor: colors.onNavy, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.red },
  permission: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: 40 },
  permissionButton: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
