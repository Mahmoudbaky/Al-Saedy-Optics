import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { Appointment, Availability, BookAppointmentInput, Doctor } from './types';

export function useDoctors() {
  return useQuery({ queryKey: qk.clinic.doctors, queryFn: () => api.getPublic<Doctor[]>('/clinic/doctors'), staleTime: 5 * 60_000 });
}

export interface AvailabilityParams {
  doctorId?: string;
  /** `YYYY-MM-DD` in the clinic timezone; defaults to today. */
  from?: string;
  days?: number;
}

/** `GET /clinic/availability` – public, so guests can browse slots before signing in. */
export function useAvailability(params: AvailabilityParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.clinic.availability(params),
    queryFn: () => api.getPublic<Availability>('/clinic/availability', { ...params, days: params.days ?? 7 }),
    staleTime: 30_000,
    enabled: options.enabled ?? true,
  });
}

export function useAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.me.appointments,
    queryFn: () => api.get<Appointment[]>('/me/appointments'),
    enabled: !!user,
  });
}

function useInvalidateAppointments() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.me.appointments });
    qc.invalidateQueries({ queryKey: qk.clinic.availabilityAll });
    qc.invalidateQueries({ queryKey: qk.me.profile });
  };
}

export function useBookAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({ mutationFn: (input: BookAppointmentInput) => api.post<Appointment>('/me/appointments', input), onSuccess: invalidate });
}

export function useCancelAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({ mutationFn: (id: string) => api.post<Appointment>(`/me/appointments/${id}/cancel`), onSuccess: invalidate });
}

export function useRescheduleAppointment() {
  const invalidate = useInvalidateAppointments();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) => api.post<Appointment>(`/me/appointments/${id}/reschedule`, { scheduledAt }),
    onSuccess: invalidate,
  });
}
