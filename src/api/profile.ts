import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { Profile, UpdateProfileInput } from './types';

/** `GET /me` – profile plus the counters shown on the account screen. */
export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.me.profile,
    queryFn: () => api.get<Profile>('/me'),
    enabled: !!user,
  });
}

/** `PATCH /me` – name / phone / locale / avatar. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  const { refresh } = useAuth();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch<Profile>('/me', input),
    onSuccess: async (profile) => {
      qc.setQueryData(qk.me.profile, profile);
      await refresh();
    },
  });
}
