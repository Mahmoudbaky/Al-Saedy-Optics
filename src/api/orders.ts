import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { CheckoutInput, Order, OrderStatus } from './types';

export function useOrders(params: { status?: OrderStatus; limit?: number } = {}) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: qk.me.orders(params),
    queryFn: ({ pageParam }) => api.getPaged<Order>('/me/orders', { ...params, limit: params.limit ?? 20, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNext ? last.meta.page + 1 : undefined),
    enabled: !!user,
  });
}

export function useOrder(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.me.order(id ?? ''),
    queryFn: () => api.get<Order>(`/me/orders/${id}`),
    enabled: !!user && !!id,
  });
}

/** `POST /me/orders/checkout` – turns the cart into an order and empties it. */
export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) => api.post<Order>('/me/orders/checkout', input),
    onSuccess: (order) => {
      qc.setQueryData(qk.me.order(order.id), order);
      qc.invalidateQueries({ queryKey: qk.me.cart });
      qc.invalidateQueries({ queryKey: qk.me.ordersAll });
      qc.invalidateQueries({ queryKey: qk.me.profile });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.post<Order>(`/me/orders/${id}/cancel`, reason ? { reason } : {}),
    onSuccess: (order) => {
      qc.setQueryData(qk.me.order(order.id), order);
      qc.invalidateQueries({ queryKey: qk.me.ordersAll });
    },
  });
}
