import { Card, Divider } from '@/components/ui';
import { spacing } from '@/theme';

import { PriceRow, type PriceRowProps } from './PriceRow';

export interface OrderSummaryCardProps {
  rows: PriceRowProps[];
  totalLabel: string;
  totalValue: string;
}

export function OrderSummaryCard({ rows, totalLabel, totalValue }: OrderSummaryCardProps) {
  return (
    <Card style={{ gap: spacing.md - 2 }}>
      {rows.map((row) => <PriceRow key={row.label} {...row} />)}
      <Divider />
      <PriceRow label={totalLabel} value={totalValue} emphasized />
    </Card>
  );
}
