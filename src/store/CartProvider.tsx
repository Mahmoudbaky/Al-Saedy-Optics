import { createContext, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';

import { getProduct, lensAddons, type CartLine, type LensAddonId, type Product } from '@/data';
import type { LocalizedString } from '@/i18n';

interface CartState {
  lines: CartLine[];
  /** Id of the prescription attached to this order, if any. */
  prescriptionId: string | null;
  promoCode: string | null;
}

type CartAction =
  | { type: 'add'; product: Product; color?: string; addons?: LensAddonId[]; variant?: LocalizedString; quantity?: number }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'attachPrescription'; prescriptionId: string | null }
  | { type: 'applyPromo'; code: string | null }
  | { type: 'clear' };

const emptyState: CartState = {
  lines: [],
  prescriptionId: null,
  promoCode: null,
};

/** Demo contents matching the design canvas; replace with persisted state when a backend exists. */
function seedState(): CartState {
  const frame = getProduct('vc-214');
  const contacts = getProduct('monthly-contacts');
  if (!frame || !contacts) return emptyState;
  return {
    ...emptyState,
    prescriptionId: 'rx-2026',
    lines: [
      { product: frame, quantity: 1, color: frame.colors[0], addons: ['blueLight'] },
      { product: contacts, quantity: 2, color: contacts.colors[0], addons: [], variant: { ar: '-1.00 · علبة ٦ عدسات', en: '-1.00 · box of 6' } },
    ],
  };
}

function sameAddons(a: LensAddonId[], b: LensAddonId[]) {
  return a.length === b.length && a.every((id) => b.includes(id));
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const color = action.color ?? action.product.colors[0];
      const addons = action.addons ?? [];
      const quantity = action.quantity ?? 1;
      const existing = state.lines.find(
        (l) => l.product.id === action.product.id && l.color === color && sameAddons(l.addons, addons),
      );
      const lines = existing
        ? state.lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + quantity } : l))
        : [...state.lines, { product: action.product, color, addons, quantity, variant: action.variant }];
      return { ...state, lines };
    }
    case 'setQuantity': {
      if (action.quantity <= 0) return reducer(state, { type: 'remove', productId: action.productId });
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.product.id === action.productId ? { ...l, quantity: action.quantity } : l,
        ),
      };
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.product.id !== action.productId) };
    case 'attachPrescription':
      return { ...state, prescriptionId: action.prescriptionId };
    case 'applyPromo':
      return { ...state, promoCode: action.code };
    case 'clear':
      return emptyState;
  }
}

const addonPrice = new Map<LensAddonId, number>(lensAddons.map((a) => [a.id, a.price]));

export function lineUnitPrice(line: CartLine): number {
  return line.product.price + line.addons.reduce((sum, id) => sum + (addonPrice.get(id) ?? 0), 0);
}

export function lineTotal(line: CartLine): number {
  return lineUnitPrice(line) * line.quantity;
}

interface CartContextValue extends CartState {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  has: (productId: string) => boolean;
  dispatch: React.Dispatch<CartAction>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, undefined, seedState);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.lines.reduce((sum, l) => sum + lineTotal(l), 0);
    const deliveryFee = 0;
    return {
      ...state,
      itemCount: state.lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      has: (id) => state.lines.some((l) => l.product.id === id),
      dispatch,
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
