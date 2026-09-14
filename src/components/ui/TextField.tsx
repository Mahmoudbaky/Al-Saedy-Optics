import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { radius, typography, useTheme, useThemedStyles, type Palette } from '@/theme';

import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  /** Validation message; turns the border red. */
  error?: string | null;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Labelled text input with error state, used by the auth, address and prescription forms. */
export function TextField({ label, hint, error, trailing, style, editable = true, ...input }: TextFieldProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      {label ? <Text variant="caption" color="textSecondary">{label}</Text> : null}
      <View style={[styles.box, focused && styles.boxFocused, error ? styles.boxError : null, !editable && styles.boxDisabled]}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          keyboardAppearance={isDark ? 'dark' : 'light'}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          {...input}
          style={styles.input}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="caption" color="red">{error}</Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted">{hint}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    field: { gap: 6 },
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      minHeight: 48,
    },
    boxFocused: { borderColor: colors.navy },
    boxError: { borderColor: colors.red },
    boxDisabled: { backgroundColor: colors.surfaceMuted },
    input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 10 },
  });
