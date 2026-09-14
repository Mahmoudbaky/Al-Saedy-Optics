import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { AppNotification, DevicePlatform, NotificationsMeta } from './types';

export function useNotifications(limit = 20) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: qk.me.notifications({ limit }),
    queryFn: ({ pageParam }) => api.getPaged<AppNotification, NotificationsMeta>('/me/notifications', { limit, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNext ? last.meta.page + 1 : undefined),
    enabled: !!user,
    staleTime: 30_000,
  });
}

/** `POST /me/notifications/read` with `"all"` or a list of ids. */
export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: 'all' | string[]) => api.post<{ unread: number }>('/me/notifications/read', { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me.notificationsAll });
      qc.invalidateQueries({ queryKey: qk.me.profile });
    },
  });
}

export const registerDevice = (token: string, platform: DevicePlatform) => api.post<null>('/me/devices', { token, platform });
export const unregisterDevice = (token: string) => api.del('/me/devices', { token });
