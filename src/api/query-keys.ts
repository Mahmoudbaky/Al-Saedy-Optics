import type { ProductListParams } from './types';

/**
 * Query key factory. Everything that depends on the signed-in user lives under
 * `['me']` so sign-out / account switch can drop it with one `removeQueries`.
 */
export const qk = {
  home: (userId: string | null) => ['home', userId ?? 'guest'] as const,
  categories: ['categories'] as const,
  brands: ['brands'] as const,
  lensAddons: ['lens-addons'] as const,
  banners: ['banners'] as const,
  products: {
    all: ['products'] as const,
    list: (params: ProductListParams) => ['products', 'list', params] as const,
    detail: (idOrSlug: string) => ['products', 'detail', idOrSlug] as const,
    reviews: (productId: string, params: object = {}) => ['products', 'detail', productId, 'reviews', params] as const,
  },
  clinic: {
    doctors: ['clinic', 'doctors'] as const,
    availability: (params: object) => ['clinic', 'availability', params] as const,
    availabilityAll: ['clinic', 'availability'] as const,
  },
  me: {
    all: ['me'] as const,
    profile: ['me', 'profile'] as const,
    cart: ['me', 'cart'] as const,
    wishlistAll: ['me', 'wishlist'] as const,
    wishlistIds: ['me', 'wishlist', 'ids'] as const,
    wishlist: ['me', 'wishlist', 'list'] as const,
    prescriptions: ['me', 'prescriptions'] as const,
    addresses: ['me', 'addresses'] as const,
    ordersAll: ['me', 'orders'] as const,
    orders: (params: object = {}) => ['me', 'orders', 'list', params] as const,
    order: (id: string) => ['me', 'orders', 'detail', id] as const,
    appointments: ['me', 'appointments'] as const,
    notificationsAll: ['me', 'notifications'] as const,
    notifications: (params: object = {}) => ['me', 'notifications', 'list', params] as const,
  },
};
