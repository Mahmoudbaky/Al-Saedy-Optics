import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CategoryChips } from '@/components/home';
import { Screen, ScreenHeader, ScreenScroll } from '@/components/layout';
import { ProductGrid } from '@/components/product';
import { Chip, ChipRow, Text } from '@/components/ui';
import { categoryFilters, categoryTitleKey, products, type CategoryFilter } from '@/data';
import { useLocale } from '@/i18n';
import { spacing } from '@/theme';

const PRICE_CAP = 100_000;
const FEATURED_BRAND = 'Vision Classic';

type Sort = 'newest' | 'price';

interface Filters {
  rectangleOnly: boolean;
  underCap: boolean;
  brandOnly: boolean;
}

const noFilters: Filters = { rectangleOnly: false, underCap: false, brandOnly: false };

type SelectableCategory = Exclude<CategoryFilter, null>;

function isCategoryId(value: unknown): value is SelectableCategory {
  return typeof value === 'string' && (categoryFilters as readonly (string | null)[]).includes(value);
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, tf, n, price } = useLocale();
  const params = useLocalSearchParams<{ category?: string }>();
  const [filters, setFilters] = useState<Filters>(noFilters);
  const [sort, setSort] = useState<Sort>('newest');

  // The URL is the source of truth for the category so home deep-links and chips stay in sync.
  const category: CategoryFilter = isCategoryId(params.category) ? params.category : null;
  const setCategory = (next: CategoryFilter) => router.setParams({ category: next ?? '' });

  const results = useMemo(() => {
    const list = products.filter(
      (p) =>
        (category === null ? p.category !== 'accessories' : p.category === category) &&
        (!filters.rectangleOnly || p.shape === 'rectangle') &&
        (!filters.underCap || p.price <= PRICE_CAP) &&
        (!filters.brandOnly || p.brand?.en === FEATURED_BRAND),
    );
    return sort === 'price' ? [...list].sort((a, b) => a.price - b.price) : list;
  }, [category, filters, sort]);

  const activeCount = Object.values(filters).filter(Boolean).length;
  const toggle = (key: keyof Filters) => setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <Screen>
      <ScreenHeader
        size="md"
        title={t.categories[categoryTitleKey[category ?? 'all']]}
        trailing={<Text variant="label" color="textSecondary">{tf(t.categories.results, { count: n(results.length) })}</Text>}
      />

      <View style={styles.toolbar}>
        <CategoryChips value={category} onChange={setCategory} inset />

        <ChipRow inset>
          <Chip icon="filter" label={activeCount ? `${t.categories.filters} · ${n(activeCount)}` : t.categories.filters} selected={activeCount > 0} onPress={() => setFilters(noFilters)} />
          <Chip label={t.categories.shape} selected={filters.rectangleOnly} onPress={() => toggle('rectangleOnly')} />
          <Chip label={t.categories.price} selected={filters.underCap} onPress={() => toggle('underCap')} />
          <Chip label={t.categories.brand} selected={filters.brandOnly} onPress={() => toggle('brandOnly')} />
          <Chip icon="sort" label={sort === 'newest' ? t.categories.sortNewest : t.categories.sortPrice} selected onPress={() => setSort(sort === 'newest' ? 'price' : 'newest')} />
        </ChipRow>
      </View>

      {activeCount > 0 ? (
        <View style={styles.activeRow}>
          {filters.rectangleOnly ? <Chip variant="removable" label={t.categories.filterRectangle} onPress={() => toggle('rectangleOnly')} /> : null}
          {filters.underCap ? <Chip variant="removable" label={tf(t.categories.filterUnder, { price: price(PRICE_CAP) })} onPress={() => toggle('underCap')} /> : null}
          {filters.brandOnly ? <Chip variant="removable" label={FEATURED_BRAND} onPress={() => toggle('brandOnly')} /> : null}
        </View>
      ) : null}

      <ScreenScroll>
        <ProductGrid products={results} imageHeight={100} />
      </ScreenScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: 10, paddingBottom: 10 },
  activeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.screen, paddingBottom: spacing.md },
});
