import { Platform, Switch, type SwitchProps } from 'react-native';

import { useTheme } from '@/theme';

/** Platform switch tinted with the brand navy. */
export function Toggle(props: SwitchProps) {
  const { colors } = useTheme();
  return (
    <Switch
      trackColor={{ true: colors.navy, false: colors.borderStrong }}
      thumbColor={Platform.OS === 'android' ? colors.onNavy : undefined}
      ios_backgroundColor={colors.borderStrong}
      {...props}
    />
  );
}
