import { Chip, ChipRow } from '@/components/ui';
import { categoryFilters, categoryLabelKey, type CategoryFilter } from '@/data';
import { useLocale } from '@/i18n';

export interface CategoryChipsProps {
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
  /** Adds the screen gutter inside the scroll so chips can bleed to the edge. */
  inset?: boolean;
}

export function CategoryChips({ value, onChange, inset = false }: CategoryChipsProps) {
  const { t } = useLocale();
  return (
    <ChipRow inset={inset}>
      {categoryFilters.map((id) => (
        <Chip key={id ?? 'all'} label={t.categories[categoryLabelKey[id ?? 'all']]} selected={value === id} onPress={() => onChange(id)} />
      ))}
    </ChipRow>
  );
}
