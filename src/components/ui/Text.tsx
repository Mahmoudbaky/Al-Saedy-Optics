import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { bodyFont, typography, useTheme, type ColorToken, type TypographyVariant } from '@/theme';

type BodyWeight = 'regular' | 'medium' | 'bold';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  /** Overrides the weight of body variants. Display variants carry their own weight. */
  weight?: BodyWeight;
  align?: TextStyle['textAlign'];
}

const bodyVariants: ReadonlySet<TypographyVariant> = new Set([
  'price', 'bodyLg', 'body', 'bodySm', 'label', 'caption', 'tiny',
]);

export function Text({ variant = 'body', color = 'text', weight, align, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const weightStyle = weight && bodyVariants.has(variant) ? bodyFont(weight) : null;
  return (
    <RNText
      {...rest}
      style={[typography[variant], { color: colors[color] }, weightStyle, align && { textAlign: align }, style]}
    />
  );
}
