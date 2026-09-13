import { StyleSheet, View } from 'react-native';

import { radius, useThemedStyles, type Palette } from '@/theme';

import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, min = 0, max = 99 }: StepperProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} hitSlop={8} accessibilityRole="button" accessibilityLabel="−">
        <Icon name="minus" size={14} strokeWidth={2} />
      </Pressable>
      <Text variant="bodySm" weight="bold" style={styles.value}>{value}</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} hitSlop={8} accessibilityRole="button" accessibilityLabel="+">
        <Icon name="plus" size={14} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  value: { minWidth: 14, textAlign: 'center' },
});
