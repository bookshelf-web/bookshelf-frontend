import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, ShieldCheck, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { RoleSelector } from '../components/RoleSelector'
import { useAuth } from '../contexts/AuthContext'
import { getApiErrorMessage } from '../lib/apiError'
import { formatCnpj, SELF_SERVICE_ROLES } from '../lib/roles'
import { meService } from '../services/me.service'
import type { SelfServiceRole } from '../types/auth'
import type { Company } from '../types/company'

export function AccountPage() {
  const { t } = useTranslation()
  const { user, roles, hasRole, applySession } = useAuth()

  const savedRoles = roles.filter((role): role is SelfServiceRole =>
    (SELF_SERVICE_ROLES as string[]).includes(role),
  )
  const [selected, setSelected] = useState<SelfServiceRole[]>(savedRoles)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [name, setName] = useState(user?.name ?? '')
  const [nameStatus, setNameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [nameError, setNameError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    let cancelled = false
    meService
      .getProfile()
      .then((profile) => {
        if (!cancelled) setCompanies(profile.companies)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getApiErrorMessage(err, 'account.loadError'))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const add = selected.filter((role) => !savedRoles.includes(role))
  const remove = savedRoles.filter((role) => !selected.includes(role))
  const changed = add.length + remove.length > 0

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const response = await meService.updateRoles({ add, remove })
      applySession(response)
      setSelected(response.user.roles.filter((r): r is SelfServiceRole => r !== 'admin'))
      setSaved(true)
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'account.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameStatus('saving')
    setNameError('')
    try {
      const response = await meService.updateProfile(name)
      applySession(response)
      setNameStatus('saved')
    } catch (err) {
      setNameError(getApiErrorMessage(err, 'profile.nameError'))
      setNameStatus('error')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus('saving')
    setPasswordError('')
    try {
      await meService.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setPasswordStatus('saved')
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, 'profile.passwordError'))
      setPasswordStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="account-page">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('account.title')}</h2>
          <p className="text-gray-600">{t('account.subtitle')}</p>
        </div>

        {!hasRole('reader') && (
          <div
            className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
            data-testid="library-off-notice"
          >
            {t('account.libraryOff')}
          </div>
        )}

        <section className="bg-white rounded-xl shadow-sm p-6 space-y-6" aria-labelledby="profile-title">
          <div>
            <h3 id="profile-title" className="text-xl font-bold text-gray-900 mb-4">
              {t('profile.title')}
            </h3>
            <form onSubmit={handleSaveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.name')}
                </label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameStatus('idle')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  data-testid="profile-name-input"
                  required
                />
              </div>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={nameStatus === 'saving' || name.trim() === '' || name === user?.name}
                data-testid="profile-name-save"
              >
                {t('profile.saveName')}
              </Button>
            </form>
            {nameStatus === 'saved' && (
              <p className="mt-2 text-sm text-green-600" role="status" data-testid="profile-name-saved">
                {t('profile.nameSaved')}
              </p>
            )}
            {nameError && (
              <p className="mt-2 text-sm text-red-600" role="alert" data-testid="profile-name-error">
                {nameError}
              </p>
            )}
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 border-t border-gray-100 pt-6">
            <h4 className="text-lg font-semibold text-gray-900">{t('profile.passwordTitle')}</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.currentPassword')}
                </label>
                <input
                  id="profile-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  data-testid="profile-current-password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label htmlFor="profile-new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.newPassword')}
                </label>
                <input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  data-testid="profile-new-password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">{t('profile.passwordHint')}</p>
              </div>
            </div>
            {passwordStatus === 'saved' && (
              <p className="text-sm text-green-600" role="status" data-testid="profile-password-saved">
                {t('profile.passwordSaved')}
              </p>
            )}
            {passwordError && (
              <p className="text-sm text-red-600" role="alert" data-testid="profile-password-error">
                {passwordError}
              </p>
            )}
            <Button
              type="submit"
              variant="outline"
              disabled={passwordStatus === 'saving'}
              data-testid="profile-password-save"
            >
              {t('profile.savePassword')}
            </Button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6" aria-labelledby="roles-title">
          <h3 id="roles-title" className="text-xl font-bold text-gray-900 mb-4">
            {t('account.rolesTitle')}
          </h3>
          <RoleSelector value={selected} onChange={setSelected} disabled={saving} testIdPrefix="account-role" />

          {saveError && (
            <p className="mt-3 text-sm text-red-600" role="alert" data-testid="account-error">
              {saveError}
            </p>
          )}
          {saved && (
            <p className="mt-3 text-sm text-green-600" role="status" data-testid="account-saved">
              {t('account.saved')}
            </p>
          )}

          <Button
            className="mt-4 bg-purple-600 hover:bg-purple-700"
            onClick={handleSave}
            disabled={saving || !changed || selected.length === 0}
            data-testid="save-roles-button"
          >
            {saving ? t('account.saving') : t('account.save')}
          </Button>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6" aria-labelledby="companies-title">
          <div className="flex items-center justify-between mb-4">
            <h3 id="companies-title" className="text-xl font-bold text-gray-900">
              {t('account.companiesTitle')}
            </h3>
            {hasRole('seller') && (
              <Link
                to="/companies/new"
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
                data-testid="add-company-link"
              >
                <Building2 className="w-4 h-4" aria-hidden="true" />
                {t('account.addCompany')}
              </Link>
            )}
          </div>

          {loadError && (
            <p className="text-sm text-red-600" role="alert">
              {loadError}
            </p>
          )}

          {!hasRole('seller') ? (
            <p className="text-sm text-gray-500" data-testid="companies-seller-only">
              {t('account.companiesSellerOnly')}
            </p>
          ) : companies.length === 0 ? (
            <p className="text-sm text-gray-500" data-testid="companies-empty">
              {t('account.companiesEmpty')}
            </p>
          ) : (
            <ul className="space-y-3" data-testid="companies-list">
              {companies.map((company) => (
                <li
                  key={company.id}
                  className="rounded-lg border border-gray-200 p-4"
                  data-testid={`company-${company.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{company.tradeName || company.legalName}</p>
                      <p className="text-sm text-gray-500">
                        {formatCnpj(company.cnpj)} · {company.address.city}/{company.address.state}
                      </p>
                      {company.myRole && (
                        <p className="text-xs text-gray-500">
                          {t('account.memberRole', { role: t(`companyRoles.${company.myRole}`) })}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        company.verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                      data-testid={`company-status-${company.id}`}
                    >
                      {company.verified ? t('account.verified') : t('account.pending')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {hasRole('admin') && (
          <section className="bg-white rounded-xl shadow-sm p-6" aria-labelledby="admin-title">
            <h3 id="admin-title" className="text-xl font-bold text-gray-900 mb-4">
              {t('account.adminTitle')}
            </h3>
            <Link
              to="/admin/users"
              className="mr-6 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
              data-testid="admin-users-link"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              {t('account.adminUsers')}
            </Link>
            <Link
              to="/admin/companies"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
              data-testid="admin-companies-link"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              {t('account.adminCompanies')}
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}
