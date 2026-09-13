import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useLocale } from '@/i18n';
import { useCart } from '@/store';
import { useTheme } from '@/theme';

/**
 * Native bottom tabs: Liquid Glass on iOS 26 (with the bar minimising on scroll),
 * Material bottom navigation on Android. Icons use SF Symbols / Material Symbols so
 * each platform renders its own glyph set.
 */
export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { itemCount } = useCart();

  return (
    <NativeTabs
      tintColor={colors.navy}
      iconColor={{ default: colors.textMuted, selected: colors.navy }}
      labelStyle={{ default: { color: colors.textMuted }, selected: { color: colors.navy, fontWeight: '700' } }}
      backgroundColor={colors.tabBar}
      badgeBackgroundColor={colors.red}
      minimizeBehavior="onScrollDown"
      indicatorColor={colors.surfaceMuted}
      rippleColor={colors.ripple}
      labelVisibilityMode="labeled"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t.tabs.home}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md={{ default: 'home', selected: 'home' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="categories">
        <NativeTabs.Trigger.Label>{t.tabs.categories}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} md={{ default: 'grid_view', selected: 'grid_view' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="try-on">
        <NativeTabs.Trigger.Label>{t.tabs.tryOn}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="eyeglasses" md="eyeglasses" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>{t.tabs.cart}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md={{ default: 'shopping_bag', selected: 'shopping_bag' }} />
        {itemCount > 0 ? <NativeTabs.Trigger.Badge>{String(itemCount)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>{t.tabs.account}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md={{ default: 'person', selected: 'person' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
