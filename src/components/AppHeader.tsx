import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { Button } from './ui/button'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import { homePathFor } from '../lib/roles'

const NAV_LINK = 'text-sm font-medium text-gray-600 hover:text-gray-900'

export function AppHeader() {
  const { t } = useTranslation()
  const { user, logout, hasRole, roles } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm" data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to={homePathFor(roles)} className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('common.appName')}</h1>
            {user && <p className="text-xs text-gray-500">{user.name}</p>}
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 sm:flex" aria-label={t('nav.main')}>
            {hasRole('reader') && (
              <Link to="/dashboard" className={NAV_LINK} data-testid="nav-library">
                {t('nav.library')}
              </Link>
            )}
            <Link to="/account" className={NAV_LINK} data-testid="nav-account">
              {t('nav.account')}
            </Link>
          </nav>
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="outline" size="sm" onClick={logout} className="hover:bg-gray-50">
            {t('dashboard.logout')}
          </Button>
        </div>
      </div>
    </header>
  )
}
