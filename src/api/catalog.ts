import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/auth/AuthProvider';

import { api } from './client';
import { qk } from './query-keys';
import type { Banner, Brand, Category, HomeBundle, LensAddon } from './types';

const CATALOG_STALE = 5 * 60_000;

/** `GET /home` – banners, categories, product rails and (when signed in) wishlist ids. */
export function useHome() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.home(user?.id ?? null),
    queryFn: () => api.get<HomeBundle>('/home'),
    staleTime: CATALOG_STALE,
  });
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => api.getPublic<Category[]>('/categories'), staleTime: CATALOG_STALE });
}

export function useBrands() {
  return useQuery({ queryKey: qk.brands, queryFn: () => api.getPublic<Brand[]>('/brands'), staleTime: CATALOG_STALE });
}

export function useLensAddons() {
  return useQuery({ queryKey: qk.lensAddons, queryFn: () => api.getPublic<LensAddon[]>('/lens-addons'), staleTime: CATALOG_STALE });
}

export function useBanners() {
  return useQuery({ queryKey: qk.banners, queryFn: () => api.getPublic<Banner[]>('/banners'), staleTime: CATALOG_STALE });
}
