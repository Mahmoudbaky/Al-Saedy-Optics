import type { Translations } from '@/i18n/translations/ar';

import type { CategoryId } from './types';

/** Category chips in display order. `null` means "all". */
export const categoryFilters = [null, 'prescription', 'sun', 'contact', 'kids'] as const;

export type CategoryFilter = (typeof categoryFilters)[number];

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
