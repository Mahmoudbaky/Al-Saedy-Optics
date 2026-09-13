import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

export function Divider({ tone = 'border' }: { tone?: 'border' | 'muted' }) {
  const { colors } = useTheme();
  return <View style={[styles.line, { backgroundColor: tone === 'border' ? colors.border : colors.surfaceMuted }]} />;
}

const styles = StyleSheet.create({
  line: { height: 1, alignSelf: 'stretch' },
});
