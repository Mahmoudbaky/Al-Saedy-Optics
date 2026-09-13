import { Text, type TextProps } from './Text';

/** Small muted caption above a group of controls ("اللون", "طريقة الدفع"). */
export function SectionLabel(props: TextProps) {
  return <Text variant="label" color="textSecondary" {...props} />;
}
