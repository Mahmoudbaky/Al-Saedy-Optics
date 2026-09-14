import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { CreatePrescriptionInput, Prescription } from './types';

export function usePrescriptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.me.prescriptions,
    queryFn: () => api.get<Prescription[]>('/me/prescriptions'),
    enabled: !!user,
  });
}

function useInvalidatePrescriptions() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.me.prescriptions });
    qc.invalidateQueries({ queryKey: qk.me.profile });
    // The cart embeds the attached prescription.
    qc.invalidateQueries({ queryKey: qk.me.cart });
  };
}

/** `POST /me/prescriptions` – new prescriptions start as `pending` until the clinic verifies them. */
export function useCreatePrescription() {
  const invalidate = useInvalidatePrescriptions();
  return useMutation({
    mutationFn: (input: CreatePrescriptionInput) => api.post<Prescription>('/me/prescriptions', input),
    onSuccess: invalidate,
  });
}

export function useDeletePrescription() {
  const invalidate = useInvalidatePrescriptions();
  return useMutation({
    mutationFn: (id: string) => api.del(`/me/prescriptions/${id}`),
    onSuccess: invalidate,
  });
}
