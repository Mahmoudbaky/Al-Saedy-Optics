import { I18nManager, type ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

type Shape =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; rx?: number };

const path = (d: string): Shape => ({ kind: 'path', d });
const circle = (cx: number, cy: number, r: number): Shape => ({ kind: 'circle', cx, cy, r });
const rect = (x: number, y: number, w: number, h: number, rx?: number): Shape => ({ kind: 'rect', x, y, w, h, rx });

/** Line icons traced from the design canvas (24×24 viewBox). */
const icons = {
  search: [circle(11, 11, 6), path('M16 16l4 4')],
  heart: [path('M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 4.5-7 9-7 9z')],
  glasses: [circle(7, 14, 4), circle(17, 14, 4), path('M11 13.5c.6-.8 1.8-.8 2.4 0M3 12l1.5-3.5M21 12l-1.5-3.5')],
  sunglasses: [rect(3, 10, 8, 7, 2), rect(13, 10, 8, 7, 2), path('M11 13h2')],
  contacts: [circle(7, 13, 4.5), circle(17, 13, 4.5)],
  lens: [circle(12, 12, 7), circle(12, 12, 2.6)],
  chevronLeft: [path('M15 5l-7 7 7 7')],
  chevronRight: [path('M9 5l7 7-7 7')],
  home: [path('M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z')],
  grid: [rect(4, 4, 6.5, 6.5, 1.5), rect(13.5, 4, 6.5, 6.5, 1.5), rect(4, 13.5, 6.5, 6.5, 1.5), rect(13.5, 13.5, 6.5, 6.5, 1.5)],
  bag: [path('M6 8h12l1 12H5zM9 8V6a3 3 0 0 1 6 0v2')],
  person: [circle(12, 8, 3.5), path('M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5')],
  filter: [path('M4 6h16M7 12h10M10 18h4')],
  sort: [path('M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3')],
  expand: [path('M15 8h5v5M9 16H4v-5')],
  rxCard: [path('M4 7h16v11H4zM8 7V5h8v2'), path('M9 12h6')],
  image: [path('M4 16l4-5 4 4 3-3 5 6M4 7h16v12H4z')],
  bookmark: [path('M6 3h12v18l-6-4-6 4z')],
  info: [circle(12, 12, 8.5), path('M12 8v.5M12 11v5')],
  pin: [path('M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z'), circle(12, 11, 2.2)],
  card: [rect(3, 7, 18, 12, 2), path('M3 11h18')],
  cash: [rect(3, 7, 18, 10, 2), circle(12, 12, 2)],
  phone: [path('M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z')],
  bell: [path('M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16z'), path('M10 22h4')],
  calendar: [rect(3, 5, 18, 14, 2), path('M3 9h18M8 3v3M16 3v3')],
  moon: [path('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z')],
  globe: [circle(12, 12, 8.5), path('M3.5 12h17M12 3.5c2.5 2.5 2.5 14 0 17M12 3.5c-2.5 2.5-2.5 14 0 17')],
  help: [circle(12, 12, 8.5), path('M9.8 9.5a2.4 2.4 0 1 1 3.2 2.3c-.7.3-1 .8-1 1.5v.3M12 16.8v.4')],
  tag: [path('M4 12l8-8 8 8-8 8z')],
  logout: [path('M15 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9M12 12h8M17 9l3 3-3 3')],
  plus: [path('M12 6v12M6 12h12')],
  minus: [path('M6 12h12')],
  close: [path('M6 6l12 12M18 6L6 18')],
  check: [path('M5 12.5l4.5 4.5L19 7')],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof icons | 'back' | 'forward';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
  /** Fill the glyph instead of stroking it (used for the active heart). */
  filled?: boolean;
}

/** Resolves direction-aware aliases so "back" always points to the reading start. */
function resolveName(name: IconName): keyof typeof icons {
  if (name === 'back') return I18nManager.isRTL ? 'chevronRight' : 'chevronLeft';
  if (name === 'forward') return I18nManager.isRTL ? 'chevronLeft' : 'chevronRight';
  return name;
}

export function Icon({ name, size = 22, color, strokeWidth = 1.6, filled = false }: IconProps) {
  const { colors } = useTheme();
  const stroke = color ?? colors.icon;
  const shapes = icons[resolveName(name)];
  const paint = {
    stroke,
    strokeWidth,
    fill: filled ? stroke : 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes.map((s, i) => {
        switch (s.kind) {
          case 'path':
            return <Path key={i} d={s.d} {...paint} />;
          case 'circle':
            return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...paint} />;
          case 'rect':
            return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...paint} />;
        }
      })}
    </Svg>
  );
}
