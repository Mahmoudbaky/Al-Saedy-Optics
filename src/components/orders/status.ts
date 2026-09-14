import type { OrderStatus } from '@/api';
import { useLocale } from '@/i18n';

/** Localized label for every order status (tracking rail + orders list). */
export function useOrderStatusLabel() {
  const { t } = useLocale();
  const labels: Record<OrderStatus, string> = {
    pending: t.tracking.pending,
    confirmed: t.tracking.confirmed,
    lab: t.tracking.lab,
    onTheWay: t.tracking.onTheWay,
    ready: t.tracking.ready,
    delivered: t.tracking.delivered,
    cancelled: t.tracking.cancelled,
  };
  return (status: OrderStatus) => labels[status];
}
