import { useTranslation } from 'react-i18next'
import { FlaskConical } from 'lucide-react'

/** Always shown around payments: this bookstore only simulates them and there is no way to hide it. */
export function TestEnvironmentBanner() {
  const { t } = useTranslation()

  return (
    <div
      role="note"
      className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-500 bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900"
      data-testid="test-environment-banner"
    >
      <FlaskConical className="h-4 w-4" aria-hidden="true" />
      {t('testEnv.banner')}
    </div>
  )
}
