import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { AddCartItemInput, Cart } from './types';

/**
 * Server-owned cart. Every mutation returns the full cart, which replaces the cache
 * directly – no refetch round-trip. Guests get an empty shell and `isGuest: true`.
 */
export function useCart() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.me.cart,
    queryFn: () => api.get<Cart>('/me/cart'),
    enabled: !!user,
    staleTime: 0,
  });

  const put = (cart: Cart) => {
    qc.setQueryData(qk.me.cart, cart);
  };

  const add = useMutation({
    mutationFn: (input: AddCartItemInput) => api.post<Cart>('/me/cart/items', { quantity: 1, addonIds: [], ...input }),
    onSuccess: put,
  });
  const setQty = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => api.patch<Cart>(`/me/cart/items/${itemId}`, { quantity }),
    onSuccess: put,
  });
  const remove = useMutation({ mutationFn: (itemId: string) => api.del<Cart>(`/me/cart/items/${itemId}`), onSuccess: put });
  const clear = useMutation({ mutationFn: () => api.del<Cart>('/me/cart'), onSuccess: put });
  const promo = useMutation({ mutationFn: (code: string | null) => api.put<Cart>('/me/cart/promo', { code }), onSuccess: put });
  const attachRx = useMutation({
    mutationFn: (prescriptionId: string | null) => api.put<Cart>('/me/cart/prescription', { prescriptionId }),
    onSuccess: put,
  });

  const cart = query.data ?? null;

  return {
    cart,
    isGuest: !user,
    isLoading: !!user && query.isPending,
    error: query.error,
    refetch: query.refetch,
    itemCount: cart?.summary.itemCount ?? 0,
    has: (productId: string) => !!cart?.items.some((i) => i.product.id === productId),
    addItem: add.mutateAsync,
    setQuantity: (itemId: string, quantity: number) => setQty.mutateAsync({ itemId, quantity }),
    removeItem: remove.mutateAsync,
    clear: clear.mutateAsync,
    applyPromo: promo.mutateAsync,
    attachPrescription: attachRx.mutateAsync,
    pending: { add: add.isPending, quantity: setQty.isPending, promo: promo.isPending, prescription: attachRx.isPending },
  };
}

export type CartApi = ReturnType<typeof useCart>;
