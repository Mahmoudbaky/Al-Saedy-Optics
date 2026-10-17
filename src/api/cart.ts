import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { AddCartItemInput, AttachLineAppointmentInput, Cart } from './types';

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
  // Per-line prescription source – option 1 (saved Rx) or option 2 (eye exam).
  const attachRx = useMutation({
    mutationFn: ({ itemId, prescriptionId }: { itemId: string; prescriptionId: string }) =>
      api.put<Cart>(`/me/cart/items/${itemId}/prescription`, { prescriptionId }),
    onSuccess: put,
  });
  const attachAppt = useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: AttachLineAppointmentInput }) => api.put<Cart>(`/me/cart/items/${itemId}/appointment`, input),
    onSuccess: (cart) => {
      put(cart);
      // Booking through the cart creates an appointment too.
      qc.invalidateQueries({ queryKey: qk.me.appointments });
      qc.invalidateQueries({ queryKey: qk.clinic.availabilityAll });
    },
  });
  const clearRx = useMutation({ mutationFn: (itemId: string) => api.del<Cart>(`/me/cart/items/${itemId}/prescription`), onSuccess: put });

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
    /** Option 1 – use one of my saved prescriptions for this line. */
    attachLinePrescription: (itemId: string, prescriptionId: string) => attachRx.mutateAsync({ itemId, prescriptionId }),
    /** Option 2 – link an upcoming exam or book a new slot for this line. */
    attachLineAppointment: (itemId: string, input: AttachLineAppointmentInput) => attachAppt.mutateAsync({ itemId, input }),
    clearLineRx: clearRx.mutateAsync,
    /** Lines that still need a prescription source. */
    rxLines: cart?.items.filter((i) => i.prescription.required) ?? [],
    pending: { add: add.isPending, quantity: setQty.isPending, promo: promo.isPending, prescription: attachRx.isPending || attachAppt.isPending || clearRx.isPending },
  };
}

export type CartApi = ReturnType<typeof useCart>;
