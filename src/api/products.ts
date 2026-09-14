import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api } from './client';
import { qk } from './query-keys';
import type { ProductCard, ProductDetail, ProductListParams, Review, ReviewsMeta } from './types';

const CATALOG_STALE = 5 * 60_000;

/** `GET /products` – paginated; call `fetchNextPage()` for the next page. */
export function useProducts(params: ProductListParams, options: { enabled?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: qk.products.list(params),
    queryFn: ({ pageParam }) => api.getPaged<ProductCard>('/products', { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNext ? last.meta.page + 1 : undefined),
    staleTime: CATALOG_STALE,
    enabled: options.enabled ?? true,
  });
}

/** `GET /products/:idOrSlug` */
export function useProduct(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: qk.products.detail(idOrSlug ?? ''),
    queryFn: () => api.get<ProductDetail>(`/products/${encodeURIComponent(idOrSlug!)}`),
    enabled: !!idOrSlug,
    staleTime: CATALOG_STALE,
  });
}

/** `GET /products/:id/reviews` */
export function useProductReviews(productId: string | undefined, params: { page?: number; limit?: number; rating?: number } = {}) {
  return useQuery({
    queryKey: qk.products.reviews(productId ?? '', params),
    queryFn: () => api.getPaged<Review, ReviewsMeta>(`/products/${productId}/reviews`, params),
    enabled: !!productId,
  });
}
