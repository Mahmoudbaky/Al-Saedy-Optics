import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useProducts, type ProductListParams } from '@/api';
import { categoryTitleKey, isCategoryId, type CategoryFilter } from '@/catalog/categories';
import { EmptyView, ErrorView, LoadingView } from '@/components/feedback';
import { CategoryChips } from '@/components/home';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { Button, Chip, ChipRow, Text } from '@/components/ui';
import { useLocale } from '@/i18n';
import { spacing } from '@/theme';

const PRICE_CAP = 100_000;
const FEATURED_BRAND = { slug: 'vision-classic', label: 'Vision Classic' };
const PAGE_SIZE = 20;

type Sort = 'newest' | 'priceAsc';

interface Filters {
  rectangleOnly: boolean;
  underCap: boolean;
  brandOnly: boolean;
}

const noFilters: Filters = { rectangleOnly: false, underCap: false, brandOnly: false };

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, tf, n, price } = useLocale();
  const params = useLocalSearchParams<{ category?: string; onSale?: string }>();
  const [filters, setFilters] = useState<Filters>(noFilters);
  const [sort, setSort] = useState<Sort>('newest');

  // The URL is the source of truth for the category so home deep-links and chips stay in sync.
  const category: CategoryFilter = isCategoryId(params.category) ? params.category : null;
  const setCategory = (next: CategoryFilter) => router.setParams({ category: next ?? '', onSale: '' });

  const query: ProductListParams = {
    category: category ?? undefined,
    shape: filters.rectangleOnly ? 'rectangle' : undefined,
    maxPrice: filters.underCap ? PRICE_CAP : undefined,
    brand: filters.brandOnly ? FEATURED_BRAND.slug : undefined,
    onSale: params.onSale === 'true' ? true : undefined,
    sort,
    limit: PAGE_SIZE,
  };
  const products = useProducts(query);
  const items = products.data?.pages.flatMap((p) => p.data) ?? [];
  const total = products.data?.pages[0]?.meta.total ?? 0;

  const activeCount = Object.values(filters).filter(Boolean).length;
  const toggle = (key: keyof Filters) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <Screen>
      <ScreenHeader
        size="md"
        title={t.categories[categoryTitleKey[category ?? 'all']]}
        trailing={products.data ? <Text variant="label" color="textSecondary">{tf(t.categories.results, { count: n(total) })}</Text> : undefined}
      />

      <View style={styles.toolbar}>
        <CategoryChips value={category} onChange={setCategory} inset />

        <ChipRow inset>
          <Chip icon="filter" label={activeCount ? `${t.categories.filters} · ${n(activeCount)}` : t.categories.filters} selected={activeCount > 0} onPress={() => setFilters(noFilters)} />
          <Chip label={t.categories.shape} selected={filters.rectangleOnly} onPress={() => toggle('rectangleOnly')} />
          <Chip label={t.categories.price} selected={filters.underCap} onPress={() => toggle('underCap')} />
          <Chip label={t.categories.brand} selected={filters.brandOnly} onPress={() => toggle('brandOnly')} />
          <Chip icon="sort" label={sort === 'newest' ? t.categories.sortNewest : t.categories.sortPrice} selected onPress={() => setSort(sort === 'newest' ? 'priceAsc' : 'newest')} />
        </ChipRow>
      </View>

      {activeCount > 0 ? (
        <View style={styles.activeRow}>
          {filters.rectangleOnly ? <Chip variant="removable" label={t.categories.filterRectangle} onPress={() => toggle('rectangleOnly')} /> : null}
          {filters.underCap ? <Chip variant="removable" label={tf(t.categories.filterUnder, { price: price(PRICE_CAP) })} onPress={() => toggle('underCap')} /> : null}
          {filters.brandOnly ? <Chip variant="removable" label={FEATURED_BRAND.label} onPress={() => toggle('brandOnly')} /> : null}
        </View>
      ) : null}

      {products.isPending ? (
        <LoadingView />
      ) : products.isError ? (
        <ErrorView error={products.error} onRetry={() => products.refetch()} />
      ) : items.length === 0 ? (
        <EmptyView icon="glasses" title={t.categories.noResults} />
      ) : (
        <ScreenScroll>
          <ProductGrid products={items} imageHeight={100} />
          {products.hasNextPage ? (
            <Button label={t.categories.loadMore} variant="outline" size="md" disabled={products.isFetchingNextPage} onPress={() => products.fetchNextPage()} />
          ) : null}
        </ScreenScroll>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: 10, paddingBottom: 10 },
  activeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.screen, paddingBottom: spacing.md },
});
