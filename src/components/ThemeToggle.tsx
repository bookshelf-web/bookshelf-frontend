import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

type Variant = 'onLight' | 'onDark'

const VARIANT_STYLES: Record<Variant, string> = {
  onLight: 'border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900',
  onDark: 'border-white/30 bg-white/10 text-white/80 hover:text-white',
}

export function ThemeToggle({ variant = 'onLight' }: { variant?: Variant }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      aria-pressed={isDark}
      data-testid="theme-toggle"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${VARIANT_STYLES[variant]}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
