import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { Address, AddressInput } from './types';

export function useAddresses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.me.addresses,
    queryFn: () => api.get<Address[]>('/me/addresses'),
    enabled: !!user,
  });
}

function useInvalidateAddresses() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: qk.me.addresses });
}

export function useCreateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: (input: AddressInput) => api.post<Address>('/me/addresses', input), onSuccess: invalidate });
}

export function useUpdateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<AddressInput> & { id: string }) => api.patch<Address>(`/me/addresses/${id}`, input),
    onSuccess: invalidate,
  });
}

export function useSetDefaultAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: (id: string) => api.post<Address>(`/me/addresses/${id}/default`), onSuccess: invalidate });
}

export function useDeleteAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: (id: string) => api.del(`/me/addresses/${id}`), onSuccess: invalidate });
}
