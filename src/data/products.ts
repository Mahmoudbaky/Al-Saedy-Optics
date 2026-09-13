import type { Product } from './types';

const swatches = {
  black: '#22262B',
  brown: '#8A5A3B',
  navy: '#16294F',
  gold: '#C0A062',
  tortoise: '#6B4A2B',
  silver: '#B8BCC4',
  clear: '#D9E4F0',
} as const;

export const products: Product[] = [
  {
    id: 'vc-214',
    code: 'VC 214',
    name: { ar: 'إطار أسيتات مستطيل', en: 'Rectangular acetate' },
    brand: { ar: 'ڤيجن كلاسيك', en: 'Vision Classic' },
    category: 'prescription',
    price: 75_000,
    compareAtPrice: 95_000,
    shape: 'rectangle',
    colors: [swatches.black, swatches.brown, swatches.navy, swatches.gold],
  },
  {
    id: 'classic-metal',
    name: { ar: 'إطار كلاسيك معدني', en: 'Classic metal frame' },
    category: 'prescription',
    price: 85_000,
    shape: 'oval',
    colors: [swatches.silver, swatches.gold, swatches.black],
    isBestSeller: true,
  },
  {
    id: 'aviator-sun',
    name: { ar: 'شمسية أفياتور', en: 'Aviator sunglasses' },
    category: 'sun',
    price: 120_000,
    shape: 'aviator',
    colors: [swatches.gold, swatches.black, swatches.silver],
    isBestSeller: true,
  },
  {
    id: 'monthly-contacts',
    name: { ar: 'عدسات لاصقة شهرية', en: 'Monthly contact lenses' },
    category: 'contact',
    price: 38_000,
    colors: [swatches.clear],
    isBestSeller: true,
  },
  {
    id: 'kids-flex',
    name: { ar: 'إطار أطفال مرن', en: 'Flexible kids frame' },
    category: 'kids',
    price: 45_000,
    shape: 'rectangle',
    colors: [swatches.navy, swatches.brown, swatches.black],
    isBestSeller: true,
  },
  {
    id: 'titanium-half',
    name: { ar: 'تيتانيوم نصف إطار', en: 'Titanium half-rim' },
    category: 'prescription',
    price: 98_000,
    shape: 'half-rim',
    colors: [swatches.silver, swatches.black],
    note: { ar: 'خفيف · ٨ غرام', en: 'Light · 8 g' },
  },
  {
    id: 'thin-round',
    name: { ar: 'إطار دائري رقيق', en: 'Thin round frame' },
    category: 'prescription',
    price: 62_000,
    shape: 'round',
    colors: [swatches.gold, swatches.black],
  },
  {
    id: 'metal-oval',
    name: { ar: 'إطار معدني بيضاوي', en: 'Oval metal frame' },
    category: 'prescription',
    price: 68_000,
    shape: 'oval',
    colors: [swatches.silver, swatches.gold],
  },
  {
    id: 'full-acetate',
    name: { ar: 'إطار كامل أسيتات', en: 'Full-rim acetate' },
    category: 'prescription',
    price: 81_000,
    shape: 'square',
    colors: [swatches.tortoise, swatches.black],
  },
  {
    id: 'vc-210',
    code: 'VC 210',
    name: { ar: 'إطار أسيتات VC 210', en: 'Acetate frame VC 210' },
    brand: { ar: 'ڤيجن كلاسيك', en: 'Vision Classic' },
    category: 'prescription',
    price: 69_000,
    shape: 'rectangle',
    colors: [swatches.black, swatches.tortoise],
  },
  {
    id: 'vc-233',
    code: 'VC 233',
    name: { ar: 'إطار أسيتات VC 233', en: 'Acetate frame VC 233' },
    brand: { ar: 'ڤيجن كلاسيك', en: 'Vision Classic' },
    category: 'prescription',
    price: 82_000,
    shape: 'square',
    colors: [swatches.navy, swatches.black],
  },
  {
    id: 'reading-150',
    name: { ar: 'إطار قراءة +1.50', en: 'Reading glasses +1.50' },
    category: 'prescription',
    price: 32_000,
    shape: 'rectangle',
    colors: [swatches.black, swatches.brown],
  },
  {
    id: 'daily-color-contacts',
    name: { ar: 'عدسات ملونة يومية', en: 'Daily coloured lenses' },
    category: 'contact',
    price: 28_000,
    colors: [swatches.clear],
  },
  {
    id: 'titanium-men',
    name: { ar: 'إطار تيتانيوم رجالي', en: "Men's titanium frame" },
    category: 'prescription',
    price: 98_000,
    shape: 'rectangle',
    colors: [swatches.silver, swatches.navy],
  },
  {
    id: 'kids-sun',
    name: { ar: 'شمسية أطفال', en: 'Kids sunglasses' },
    category: 'kids',
    price: 34_000,
    shape: 'round',
    colors: [swatches.navy, swatches.brown],
  },
  {
    id: 'square-sun',
    name: { ar: 'شمسية مربعة', en: 'Square sunglasses' },
    category: 'sun',
    price: 110_000,
    shape: 'square',
    colors: [swatches.black, swatches.tortoise],
    note: { ar: 'عدسة مستقطبة', en: 'Polarised lens' },
  },
  {
    id: 'case-cleaner',
    name: { ar: 'علبة + منظف عدسات', en: 'Case + lens cleaner' },
    category: 'accessories',
    price: 9_000,
    colors: [swatches.black],
  },
];

const byId = new Map(products.map((p) => [p.id, p]));

export function getProduct(id: string): Product | undefined {
  return byId.get(id);
}

export function getProducts(ids: readonly string[]): Product[] {
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export const bestSellers = products.filter((p) => p.isBestSeller);

/** Items shown under "You may also like" on the product page. */
export const relatedProductIds = ['vc-210', 'vc-233', 'case-cleaner'] as const;

export const lensAddons = [
  { id: 'blueLight', price: 15_000 },
  { id: 'antiGlare', price: 10_000 },
  { id: 'thin', price: 25_000 },
] as const;
