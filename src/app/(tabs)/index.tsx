import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';

import { useHome, type Banner } from '@/api';
import type { CategoryFilter } from '@/catalog/categories';
import { ErrorView, LoadingView } from '@/components/feedback';
import { CategoryChips, HeroBanner, SearchBar, TryOnBanner } from '@/components/home';
import { Screen, ScreenScroll } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { IconButton, SectionHeader } from '@/components/ui';
import { useLocale } from '@/i18n';
import { spacing } from '@/theme';

const mark = require('@/assets/brand/mark.png');

export default function HomeScreen() {
  const router = useRouter();
  const { t, l } = useLocale();
  const home = useHome();

  const openCategory = (category: CategoryFilter) =>
    router.push({ pathname: '/(tabs)/categories', params: category ? { category } : {} });

  // Banners carry an in-app path such as "/categories?category=sun" or "/book-exam".
  const openBanner = (banner: Banner) => {
    if (!banner.link) return router.push('/book-exam');
    const link = banner.link.replace(/^\/categories/, '/(tabs)/categories');
    router.push(link as Href);
  };

  const hero = home.data?.banners[0];

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
            title={hero ? l(hero.title) : t.home.heroTitle}
            subtitle={hero?.subtitle ? l(hero.subtitle) : undefined}
            ctaLabel={hero?.cta ? l(hero.cta) : t.home.heroCta}
            imageUrl={hero?.imageUrl}
            placeholder={l({ ar: 'صورة الحملة', en: 'Campaign image' })}
            onPress={() => (hero ? openBanner(hero) : router.push('/book-exam'))}
          />
          <TryOnBanner title={t.home.tryOnTitle} subtitle={t.home.tryOnSubtitle} onPress={() => router.push('/(tabs)/try-on')} />

          {home.isPending ? (
            <LoadingView compact />
          ) : home.isError ? (
            <ErrorView error={home.error} onRetry={() => home.refetch()} compact />
          ) : (
            <>
              <SectionHeader title={t.home.bestSellers} actionLabel={t.common.seeAll} onAction={() => openCategory(null)} />
              <ProductGrid products={home.data.bestSellers} showCategory />
              {home.data.newArrivals.length ? (
                <>
                  <SectionHeader title={t.home.newArrivals} actionLabel={t.common.seeAll} onAction={() => openCategory(null)} />
                  <ProductGrid products={home.data.newArrivals.slice(0, 4)} showCategory />
                </>
              ) : null}
              {home.data.onSale.length ? (
                <>
                  <SectionHeader title={t.home.onSale} actionLabel={t.common.seeAll} onAction={() => router.push({ pathname: '/(tabs)/categories', params: { onSale: 'true' } })} />
                  <ProductGrid products={home.data.onSale.slice(0, 4)} showCategory />
                </>
              ) : null}
            </>
          )}
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
