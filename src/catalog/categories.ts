import type { Translations } from '@/i18n/translations/ar';

/** Backend category slugs the app knows how to label. */
export type CategoryId = 'prescription' | 'sun' | 'contact' | 'kids' | 'accessories';

/** Category chips in display order. `null` means "all". */
export const categoryFilters = [null, 'prescription', 'sun', 'contact', 'kids'] as const;

export type CategoryFilter = (typeof categoryFilters)[number];

export function isCategoryId(value: unknown): value is Exclude<CategoryFilter, null> {
  return typeof value === 'string' && (categoryFilters as readonly (string | null)[]).includes(value);
}

/** Label key for any backend slug – unknown slugs fall back to "all". */
export function categoryLabelFor(slug: string): CategoryKeys {
  return categoryLabelKey[(slug in categoryLabelKey ? slug : 'all') as CategoryId | 'all'];
}

type CategoryKeys = keyof Translations['categories'];

export const categoryLabelKey: Record<CategoryId | 'all', CategoryKeys> = {
  all: 'all',
  prescription: 'prescription',
  sun: 'sun',
  contact: 'contact',
  kids: 'kids',
  accessories: 'all',
};

export const categoryTitleKey: Record<CategoryId | 'all', CategoryKeys> = {
  all: 'allTitle',
  prescription: 'prescriptionTitle',
  sun: 'sunTitle',
  contact: 'contactTitle',
  kids: 'kidsTitle',
  accessories: 'allTitle',
};
