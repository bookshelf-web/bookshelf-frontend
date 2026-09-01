import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Mail, Lock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useAuth } from '../contexts/AuthContext'
import { getApiErrorMessage } from '../lib/apiError'

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(getApiErrorMessage(err, 'login.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
      data-testid="login-page"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher variant="onDark" />
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('common.appName')}</h1>
          <p className="text-white/80 text-sm">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm text-center"
            data-testid="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              {t('common.email')}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="email-input"
                aria-label={t('login.emailAriaLabel')}
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder={t('common.emailPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              {t('common.password')}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                aria-label={t('login.passwordAriaLabel')}
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder={t('common.passwordPlaceholder')}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-600 hover:bg-white/90 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            data-testid="login-button"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-white font-semibold hover:underline transition-all">
              {t('login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
