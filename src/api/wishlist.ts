import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { ProductCard } from './types';

type ToggleResult = { productId: string; inWishlist: boolean };

/**
 * Wishlist ids for hearts (cheap, always fresh) plus an optimistic toggle.
 * Use `useWishlistProducts()` for the full list screen.
 */
export function useWishlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const ids = useQuery({
    queryKey: qk.me.wishlistIds,
    queryFn: () => api.get<string[]>('/me/wishlist/ids'),
    enabled: !!user,
    staleTime: 0,
  });

  const toggle = useMutation({
    mutationFn: (productId: string) => api.post<ToggleResult>(`/me/wishlist/${productId}/toggle`),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: qk.me.wishlistIds });
      const previous = qc.getQueryData<string[]>(qk.me.wishlistIds) ?? [];
      qc.setQueryData<string[]>(qk.me.wishlistIds, previous.includes(productId) ? previous.filter((id) => id !== productId) : [...previous, productId]);
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx) qc.setQueryData(qk.me.wishlistIds, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.me.wishlistAll });
      qc.invalidateQueries({ queryKey: qk.me.profile });
    },
  });

  const list = ids.data ?? [];
  return {
    ids: list,
    isGuest: !user,
    has: (productId: string) => list.includes(productId),
    toggle: toggle.mutateAsync,
  };
}

/** `GET /me/wishlist` – full product cards for the wishlist screen. */
export function useWishlistProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.me.wishlist,
    queryFn: () => api.get<ProductCard[]>('/me/wishlist'),
    enabled: !!user,
  });
}
