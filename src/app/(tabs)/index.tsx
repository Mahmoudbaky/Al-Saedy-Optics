import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { CategoryChips, HeroBanner, SearchBar, TryOnBanner } from '@/components/home';
import { Screen, ScreenScroll } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { IconButton, SectionHeader } from '@/components/ui';
import { bestSellers, type CategoryFilter } from '@/data';
import { useLocale } from '@/i18n';
import { spacing } from '@/theme';

const mark = require('@/assets/brand/mark.png');

export default function HomeScreen() {
  const router = useRouter();
  const { t, l } = useLocale();

  const openCategory = (category: CategoryFilter) =>
    router.push({ pathname: '/(tabs)/categories', params: category ? { category } : {} });

  return (
    <Screen>
      <View style={styles.header}>
        <Image source={mark} style={styles.mark} contentFit="contain" />
        <SearchBar placeholder={t.home.searchPlaceholder} onPress={() => openCategory(null)} />
        <IconButton icon="heart" size={34} iconSize={22} onPress={() => router.push('/wishlist')} accessibilityLabel={t.wishlist.title} />
      </View>

      <ScreenScroll gutter={false}>
        <CategoryChips value={null} onChange={openCategory} inset />
        <View style={styles.body}>
          <HeroBanner
            title={t.home.heroTitle}
            ctaLabel={t.home.heroCta}
            placeholder={l({ ar: 'صورة الحملة', en: 'Campaign image' })}
            onPress={() => router.push('/book-exam')}
          />
          <TryOnBanner title={t.home.tryOnTitle} subtitle={t.home.tryOnSubtitle} onPress={() => router.push('/(tabs)/try-on')} />
          <SectionHeader title={t.home.bestSellers} actionLabel={t.common.seeAll} onAction={() => openCategory(null)} />
          <ProductGrid products={bestSellers} showCategory />
        </View>
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: 6,
    paddingBottom: spacing.md,
  },
  mark: { width: 26, height: 29 },
  body: { paddingHorizontal: spacing.screen, gap: spacing.lg },
});
