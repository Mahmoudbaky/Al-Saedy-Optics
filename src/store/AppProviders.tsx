import type { PropsWithChildren } from 'react';

import { LocaleProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';

import { CartProvider } from './CartProvider';
import { WishlistProvider } from './WishlistProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
