import { getProduct } from './products';
import type { Doctor, ExamDay, ExamSlot, Order, Prescription, UserProfile } from './types';

export const currentUser: UserProfile = {
  name: { ar: 'مريم عبد الله', en: 'Mariam Abdullah' },
  phone: '0770 123 4567',
  address: {
    ar: 'بغداد · الكرادة، شارع ٦٢، بناية ١٤',
    en: 'Baghdad · Karrada, St. 62, Bldg 14',
  },
};

export const prescriptions: Prescription[] = [
  {
    id: 'rx-2026',
    doctor: { ar: 'وصفة د. أحمد الصاعدي', en: 'Dr. Ahmed Al-Saedy' },
    issuedOn: { ar: '١٢ آب ٢٠٢٦', en: '12 Aug 2026' },
    status: 'verified',
    od: { sph: '-1.25', cyl: '-0.50', axis: '180' },
    os: { sph: '-1.00', cyl: '', axis: '' },
    pd: '62',
  },
  {
    id: 'rx-2025',
    doctor: { ar: 'وصفة قديمة', en: 'Old prescription' },
    issuedOn: { ar: 'آذار ٢٠٢٥', en: 'Mar 2025' },
    status: 'expired',
    od: { sph: '-1.00', cyl: '-0.25', axis: '175' },
    os: { sph: '-0.75', cyl: '', axis: '' },
    pd: '62',
  },
];

const vc214 = getProduct('vc-214')!;
const contacts = getProduct('monthly-contacts')!;

export const orders: Order[] = [
  {
    id: '10428',
    total: 128_000,
    itemCount: 3,
    eta: { ar: 'الخميس ١٤ آب · ٤–٧ م', en: 'Thu 14 Aug · 4–7 PM' },
    currentStatus: 'onTheWay',
    events: [
      { status: 'confirmed', at: { ar: 'الاثنين ١١ آب · ٢:١٤ م', en: 'Mon 11 Aug · 2:14 PM' } },
      { status: 'lab', at: { ar: 'الثلاثاء ١٢ آب · ١٠:٠٠ ص', en: 'Tue 12 Aug · 10:00 AM' } },
      { status: 'onTheWay', at: { ar: 'الأربعاء ١٣ آب · ٥:٤٠ م', en: 'Wed 13 Aug · 5:40 PM' } },
      { status: 'delivered' },
    ],
    courier: { name: { ar: 'حسن', en: 'Hassan' } },
    lines: [
      {
        product: vc214,
        quantity: 1,
        unitPrice: 90_000,
        variant: { ar: 'عدسة حماية زرقاء', en: 'Blue-light lenses' },
      },
      {
        product: contacts,
        quantity: 2,
        unitPrice: 38_000,
        variant: { ar: '-1.00', en: '-1.00' },
      },
    ],
  },
];

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export const examDoctor: Doctor = {
  name: { ar: 'د. أحمد الصاعدي', en: 'Dr. Ahmed Al-Saedy' },
};

export const examDays: ExamDay[] = [
  { id: 'wed', weekday: { ar: 'الأربعاء', en: 'Wed' }, day: 13 },
  { id: 'thu', weekday: { ar: 'الخميس', en: 'Thu' }, day: 14 },
  { id: 'sat', weekday: { ar: 'السبت', en: 'Sat' }, day: 16 },
  { id: 'sun', weekday: { ar: 'الأحد', en: 'Sun' }, day: 17 },
];

export const examSlots: ExamSlot[] = [
  { id: '10:00', time: { ar: '١٠:٠٠ ص', en: '10:00 AM' }, available: true },
  { id: '11:30', time: { ar: '١١:٣٠ ص', en: '11:30 AM' }, available: true },
  { id: '12:00', time: { ar: '١٢:٠٠ م', en: '12:00 PM' }, available: false },
  { id: '16:00', time: { ar: '٤:٠٠ م', en: '4:00 PM' }, available: true },
  { id: '17:30', time: { ar: '٥:٣٠ م', en: '5:30 PM' }, available: true },
  { id: '19:00', time: { ar: '٧:٠٠ م', en: '7:00 PM' }, available: true },
];

export const nextAppointment = { ar: 'الأربعاء ١٣ آب · ٤:٠٠ م', en: 'Wed 13 Aug · 4:00 PM' };
