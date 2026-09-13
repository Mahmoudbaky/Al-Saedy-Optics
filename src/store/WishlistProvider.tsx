import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

interface WishlistContextValue {
  ids: readonly string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/** Pre-filled so the wishlist screen matches the design canvas. */
const seedIds = ['aviator-sun', 'reading-150', 'daily-color-contacts', 'case-cleaner', 'titanium-men', 'kids-sun'];

export function WishlistProvider({ children }: PropsWithChildren) {
  const [ids, setIds] = useState<string[]>(seedIds);

  const toggle = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, has: (id) => ids.includes(id), toggle, remove }),
    [ids, toggle, remove],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
