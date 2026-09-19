import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'

const MAX_STARS = 5

export function StarRating({ rating, testId }: { rating: number; testId?: string }) {
  const { t } = useTranslation()

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={t('dashboard.bookList.ratingAriaLabel', { rating })}
      data-testid={testId}
      data-rating={rating}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}
