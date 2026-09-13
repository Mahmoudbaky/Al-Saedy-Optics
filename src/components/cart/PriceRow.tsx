import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { ColorToken } from '@/theme';

export interface PriceRowProps {
  label: string;
  value: string;
  valueColor?: ColorToken;
  emphasized?: boolean;
}

export function PriceRow({ label, value, valueColor = 'text', emphasized = false }: PriceRowProps) {
  const variant = emphasized ? 'bodyLg' : 'bodySm';
  const weight = emphasized ? 'bold' : 'regular';
  return (
    <View style={styles.row}>
      <Text variant={variant} color={emphasized ? 'text' : 'textSecondary'} weight={weight}>{label}</Text>
      <Text variant={variant} color={valueColor} weight={weight}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
