import { useTranslation } from 'react-i18next'
import type { OrderStatus } from '../types/marketplace'

const COLORS: Record<OrderStatus, string> = {
  awaiting_payment: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-700',
}

export function OrderStatusBadge({ status, testId }: { status: OrderStatus; testId?: string }) {
  const { t } = useTranslation()

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`} data-testid={testId}>
      {t(`orderStatus.${status}`)}
    </span>
  )
}
