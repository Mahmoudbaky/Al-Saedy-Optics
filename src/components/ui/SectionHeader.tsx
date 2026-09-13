import { StyleSheet, View } from 'react-native';

import { Pressable } from './Pressable';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="sectionTitle">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="label" color="red">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
});
