import type { ImageSourcePropType } from 'react-native';

import type { LocalizedString } from '@/i18n';

export type CategoryId = 'prescription' | 'sun' | 'contact' | 'kids' | 'accessories';

export type FrameShape = 'rectangle' | 'round' | 'oval' | 'aviator' | 'square' | 'half-rim';

export interface Product {
  id: string;
  /** Short model code shown in related items, e.g. "VC 214". */
  code?: string;
  name: LocalizedString;
  brand?: LocalizedString;
  category: CategoryId;
  price: number;
  compareAtPrice?: number;
  shape?: FrameShape;
  /** Hex swatches; the first one is the default selection. */
  colors: string[];
  /** Optional short descriptor, e.g. "خفيف · ٨ غرام". */
  note?: LocalizedString;
  image?: ImageSourcePropType;
  isBestSeller?: boolean;
}

export type LensAddonId = 'blueLight' | 'antiGlare' | 'thin';

export interface LensAddon {
  id: LensAddonId;
  price: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
  color: string;
  addons: LensAddonId[];
  /** Free-text variant summary shown under the name (e.g. lens power). */
  variant?: LocalizedString;
}

export interface EyeValues {
  sph: string;
  cyl: string;
  axis: string;
}

export interface Prescription {
  id: string;
  doctor: LocalizedString;
  issuedOn: LocalizedString;
  status: 'verified' | 'expired';
  od: EyeValues;
  os: EyeValues;
  pd: string;
  add?: string;
}

export type OrderStatus = 'confirmed' | 'lab' | 'onTheWay' | 'delivered';

export interface OrderEvent {
  status: OrderStatus;
  at?: LocalizedString;
}

export interface Order {
  id: string;
  total: number;
  itemCount: number;
  eta: LocalizedString;
  currentStatus: OrderStatus;
  events: OrderEvent[];
  courier: { name: LocalizedString };
  lines: { product: Product; quantity: number; variant: LocalizedString; unitPrice: number }[];
}

export interface Doctor {
  name: LocalizedString;
  specialty?: LocalizedString;
}

export interface ExamDay {
  id: string;
  weekday: LocalizedString;
  day: number;
}

export interface ExamSlot {
  id: string;
  time: LocalizedString;
  available: boolean;
}

export interface UserProfile {
  name: LocalizedString;
  phone: string;
  address: LocalizedString;
}
