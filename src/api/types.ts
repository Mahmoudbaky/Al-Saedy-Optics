/**
 * Hand-written mirrors of the backend response DTOs (`src/modules/<x>/<x>.schema.ts`).
 * Money is integer IQD, ids are UUIDs, bilingual text is `{ ar, en }`.
 */
import type { LocalizedString } from '@/i18n';

export type { LocalizedString };
type L = LocalizedString;

export type FrameShape = 'rectangle' | 'round' | 'oval' | 'aviator' | 'square' | 'half-rim' | 'cat-eye';
export type Gender = 'men' | 'women' | 'unisex' | 'kids';
export type OrderStatus = 'pending' | 'confirmed' | 'lab' | 'onTheWay' | 'ready' | 'delivered' | 'cancelled';
export type DeliveryMethod = 'home' | 'pickup';
export type PaymentMethod = 'cod' | 'wallet' | 'card';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PrescriptionStatus = 'pending' | 'verified' | 'expired' | 'rejected';
export type PrescriptionSource = 'manual' | 'upload' | 'clinic';
export type AppointmentReason = 'exam' | 'rx' | 'contacts';
export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'noShow';
export type DevicePlatform = 'ios' | 'android' | 'web';
export type ProductSort = 'newest' | 'priceAsc' | 'priceDesc' | 'bestSelling' | 'rating' | 'name';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* ── Catalogue ─────────────────────────────────────────────────────── */

export interface Category {
  id: string;
  slug: string;
  name: L;
  description: L | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: L;
  logoUrl: string | null;
  isActive: boolean;
}

export interface LensAddon {
  /** Stable key, e.g. `blueLight`. */
  id: string;
  name: L;
  description: L | null;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: L;
  subtitle: L | null;
  cta: L | null;
  imageUrl: string | null;
  /** In-app route, e.g. `/categories?category=sun`. */
  link: string | null;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface FrameSpecs {
  lensWidth?: number;
  bridge?: number;
  templeLength?: number;
  frameWidth?: number;
  lensHeight?: number;
  weightGrams?: number;
  material?: string;
}

export interface ProductCard {
  id: string;
  slug: string;
  code: string | null;
  name: L;
  brand: Pick<Brand, 'id' | 'slug' | 'name'> | null;
  category: Pick<Category, 'id' | 'slug' | 'name'>;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number;
  shape: FrameShape | null;
  gender: Gender | null;
  /** Hex swatches, one per variant. */
  colors: string[];
  note: L | null;
  image: string | null;
  isBestSeller: boolean;
  isNew: boolean;
  inStock: boolean;
  rating: { average: number; count: number };
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  variantId: string | null;
}

export interface ProductVariant {
  id: string;
  colorHex: string;
  colorName: L | null;
  sku: string | null;
  stock: number;
  inStock: boolean;
  sortOrder: number;
  isActive: boolean;
  images: string[];
}

export interface ProductDetail extends ProductCard {
  description: L | null;
  specs: FrameSpecs | null;
  supportsLensAddons: boolean;
  requiresPrescription: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  related: ProductCard[];
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  shape?: FrameShape;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  bestSeller?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  ids?: string[];
  sort?: ProductSort;
}

export interface HomeBundle {
  banners: Banner[];
  categories: Category[];
  bestSellers: ProductCard[];
  newArrivals: ProductCard[];
  onSale: ProductCard[];
  lensAddons: LensAddon[];
  /** Only present when signed in. */
  wishlistIds?: string[];
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
}

export interface ReviewsMeta extends PageMeta {
  summary: { average: number; count: number; distribution: Record<string, number> };
}

/* ── Customer ──────────────────────────────────────────────────────── */

export interface Profile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  locale: string;
  image: string | null;
  role: string;
  createdAt: string;
  stats: {
    orders: number;
    prescriptions: number;
    wishlist: number;
    unreadNotifications: number;
    nextAppointmentAt: string | null;
  };
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  locale?: 'ar' | 'en';
  image?: string | null;
}

export interface Address {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  city: string;
  area: string;
  street: string | null;
  building: string | null;
  notes: string | null;
  isDefault: boolean;
  formatted: string;
}

export interface AddressInput {
  label?: string | null;
  recipientName: string;
  phone: string;
  city: string;
  area: string;
  street?: string | null;
  building?: string | null;
  notes?: string | null;
  isDefault?: boolean;
}

export interface EyeValues {
  sph: string | null;
  cyl: string | null;
  axis: string | null;
}

export interface Prescription {
  id: string;
  userId: string;
  label: string | null;
  doctorName: string | null;
  /** `YYYY-MM-DD` */
  issuedOn: string | null;
  expiresOn: string | null;
  source: PrescriptionSource;
  status: PrescriptionStatus;
  od: EyeValues;
  os: EyeValues;
  pd: string | null;
  add: string | null;
  imageUrl: string | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface CreatePrescriptionInput {
  label?: string | null;
  doctorName?: string | null;
  issuedOn?: string | null;
  source?: PrescriptionSource;
  od: Partial<EyeValues>;
  os: Partial<EyeValues>;
  pd?: string | null;
  add?: string | null;
  imageUrl?: string | null;
}

export interface CartItem {
  id: string;
  product: ProductCard;
  variant: { id: string; colorHex: string; colorName: L | null; stock: number };
  quantity: number;
  addons: { id: string; name: L; price: number }[];
  /** e.g. contact-lens power `-1.00` */
  variantLabel: string | null;
  unitPrice: number;
  lineTotal: number;
  available: boolean;
  issue: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  prescription: Prescription | null;
  requiresPrescription: boolean;
  promo: { code: string | null; discount: number; error: string | null };
  summary: {
    itemCount: number;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    freeDeliveryThreshold: number;
    total: number;
    currency: string;
  };
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity?: number;
  addonIds?: string[];
  variantLabel?: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  name: L;
  code: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  variantLabel: string | null;
  addons: { id: string; name: L; price: number }[];
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  address: Omit<Address, 'id' | 'label' | 'isDefault'> | null;
  prescription: { id: string; od: EyeValues; os: EyeValues; pd: string | null; add: string | null } | null;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  currency: string;
  promoCode: string | null;
  customerNote: string | null;
  courier: { name: string; phone: string | null } | null;
  eta: L | null;
  timeline: { status: OrderStatus; at: string | null; note: string | null }[];
  canCancel: boolean;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutInput {
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  addressId?: string;
  prescriptionId?: string;
  note?: string;
}

export interface Doctor {
  id: string;
  name: L;
  specialty: L | null;
  imageUrl: string | null;
  /** ISO weekdays, 1 = Monday … 7 = Sunday. */
  workingDays: number[];
  isActive: boolean;
}

export interface AvailabilitySlot {
  /** ISO instant to send back as `scheduledAt`. */
  startsAt: string;
  /** `HH:mm` in the clinic timezone. */
  time: string;
  available: boolean;
}

export interface Availability {
  doctor: Doctor;
  timezone: string;
  slotMinutes: number;
  days: { date: string; weekday: number; slots: AvailabilitySlot[] }[];
}

export interface Appointment {
  id: string;
  doctor: Pick<Doctor, 'id' | 'name' | 'specialty' | 'imageUrl'>;
  scheduledAt: string;
  reason: AppointmentReason;
  status: AppointmentStatus;
  remindMe: boolean;
  notes: string | null;
  canCancel: boolean;
  createdAt: string;
}

export interface BookAppointmentInput {
  doctorId?: string;
  scheduledAt: string;
  reason: AppointmentReason;
  remindMe?: boolean;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: L;
  body: L;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsMeta extends PageMeta {
  unread: number;
}
