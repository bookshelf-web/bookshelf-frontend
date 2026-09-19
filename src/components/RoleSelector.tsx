import { useTranslation } from 'react-i18next'
import { SELF_SERVICE_ROLES } from '../lib/roles'
import type { SelfServiceRole } from '../types/auth'

type Variant = 'onLight' | 'onDark'

interface RoleSelectorProps {
  value: SelfServiceRole[]
  onChange: (roles: SelfServiceRole[]) => void
  variant?: Variant
  disabled?: boolean
  testIdPrefix?: string
}

const STYLES: Record<Variant, { option: string; active: string; hint: string; label: string }> = {
  onLight: {
    option: 'border-gray-200 bg-white hover:border-purple-300',
    active: 'border-purple-500 bg-purple-50',
    hint: 'text-gray-500',
    label: 'text-gray-900',
  },
  onDark: {
    option: 'border-white/30 bg-white/10 hover:border-white/60',
    active: 'border-white bg-white/25',
    hint: 'text-white/70',
    label: 'text-white',
  },
}

/** Combinable choices: library, buying and selling. Choosing seller implies buying. */
export function RoleSelector({
  value,
  onChange,
  variant = 'onLight',
  disabled,
  testIdPrefix = 'role',
}: RoleSelectorProps) {
  const { t } = useTranslation()
  const styles = STYLES[variant]

  const toggle = (role: SelfServiceRole) => {
    onChange(value.includes(role) ? value.filter((item) => item !== role) : [...value, role])
  }

  return (
    <div className="space-y-2">
      {SELF_SERVICE_ROLES.map((role) => {
        const checked = value.includes(role)
        return (
          <label
            key={role}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
              checked ? styles.active : styles.option
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(role)}
              disabled={disabled}
              data-testid={`${testIdPrefix}-${role}`}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className={`block text-sm font-medium ${styles.label}`}>{t(`roles.${role}`)}</span>
              <span className={`block text-xs ${styles.hint}`}>{t(`roles.${role}Hint`)}</span>
            </span>
          </label>
        )
      })}
    </div>
  )
}
