import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { Pagination } from '../components/Pagination'
import { useAuth } from '../contexts/AuthContext'
import { getApiErrorMessage } from '../lib/apiError'
import { adminUsersService } from '../services/adminUsers.service'
import type { AdminUser, AdminUsersQuery, AdminUsersResponse, UserStatus } from '../types/admin'
import type { Role } from '../types/auth'

const PAGE_SIZE = 10
const ALL_ROLES: Role[] = ['reader', 'buyer', 'seller', 'admin']
const FIELD =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'

interface Loaded {
  key: string
  data: AdminUsersResponse | null
  error: string
}

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { user: me } = useAuth()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)

  const query: AdminUsersQuery = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
  }
  const key = `${version}:${JSON.stringify(query)}`

  // Only a real change of the search text resets the page (see the same guard in the dashboard).
  const appliedSearch = useRef('')
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim()
      if (next === appliedSearch.current) return
      appliedSearch.current = next
      setSearch(next)
      setPage(1)
    }, 300)
    return () => clearTimeout(id)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    adminUsersService
      .list(query)
      .then((data) => {
        if (!cancelled) setLoaded({ key, data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setLoaded({ key, data: null, error: getApiErrorMessage(err, 'adminUsers.loadError') })
      })
    return () => {
      cancelled = true
    }
    // `key` already encodes the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loading = loaded === null || loaded.key !== key
  const users = loaded?.data?.users ?? []
  const pagination = loaded?.data?.pagination

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="admin-users-page">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('adminUsers.title')}</h2>
          <p className="text-gray-600">{t('adminUsers.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('adminUsers.searchPlaceholder')}
              aria-label={t('adminUsers.searchAriaLabel')}
              data-testid="admin-users-search"
              className={`w-full pl-9 ${FIELD}`}
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as Role | '')
              setPage(1)
            }}
            aria-label={t('adminUsers.roleAriaLabel')}
            data-testid="admin-users-role"
            className={FIELD}
          >
            <option value="">{t('adminUsers.roleAll')}</option>
            {ALL_ROLES.map((value) => (
              <option key={value} value={value}>
                {t(`roles.${value}`)}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as UserStatus | '')
              setPage(1)
            }}
            aria-label={t('adminUsers.statusAriaLabel')}
            data-testid="admin-users-status"
            className={FIELD}
          >
            <option value="">{t('adminUsers.statusAll')}</option>
            <option value="active">{t('adminUsers.statusActive')}</option>
            <option value="suspended">{t('adminUsers.statusSuspended')}</option>
          </select>
        </div>

        {loaded?.error && (
          <p className="text-sm text-red-600" role="alert" data-testid="admin-users-error">
            {loaded.error}
          </p>
        )}

        {pagination && (
          <p className="text-sm text-gray-500" data-testid="admin-users-count" aria-live="polite">
            {t('adminUsers.resultsCount', { count: pagination.total })}
          </p>
        )}

        {!loading && !loaded?.error && users.length === 0 ? (
          <p className="text-gray-500" data-testid="admin-users-empty">
            {t('adminUsers.empty')}
          </p>
        ) : (
          <ul className={`space-y-3 ${loading ? 'opacity-60' : ''}`} aria-busy={loading} data-testid="admin-users-list">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4"
                data-testid={`admin-user-${user.id}`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">
                    {user.name}
                    {user.id === me?.id && (
                      <span className="ml-2 text-xs font-normal text-gray-500">({t('adminUsers.you')})</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.roles.map((value) => (
                      <span key={value} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {t(`roles.${value}`)}
                      </span>
                    ))}
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                      data-testid={`admin-user-status-${user.id}`}
                    >
                      {user.status === 'active' ? t('adminUsers.statusActive') : t('adminUsers.statusSuspended')}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(user)}
                  data-testid={`admin-user-edit-${user.id}`}
                >
                  {t('adminUsers.edit')}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={pagination?.page ?? page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage} />
      </main>

      {editing && (
        <EditUserDialog
          key={editing.id}
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            setVersion((v) => v + 1)
          }}
        />
      )}
    </div>
  )
}

function EditUserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [roles, setRoles] = useState<Role[]>(user.roles)
  const [status, setStatus] = useState<UserStatus>(user.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleRole = (value: Role) =>
    setRoles((current) => (current.includes(value) ? current.filter((r) => r !== value) : [...current, value]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Only what changed is sent, so the audit log records real edits.
      const changes = {
        ...(name !== user.name && { name }),
        ...(email !== user.email && { email }),
        ...(status !== user.status && { status }),
        ...(JSON.stringify([...roles].sort()) !== JSON.stringify([...user.roles].sort()) && { roles }),
      }
      if (Object.keys(changes).length === 0) {
        onClose()
        return
      }
      await adminUsersService.update(user.id, changes)
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err, 'adminUsers.saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t('adminUsers.editTitle')}
      data-testid="edit-user-dialog"
    >
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 m-auto space-y-4">
        <h3 className="text-xl font-bold text-gray-900">{t('adminUsers.editTitle')}</h3>

        {error && (
          <p className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert" data-testid="edit-user-error">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="edit-user-name" className="block text-sm font-medium text-gray-700 mb-1">
            {t('adminUsers.name')}
          </label>
          <input
            id="edit-user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full ${FIELD}`}
            data-testid="edit-user-name"
            required
          />
        </div>

        <div>
          <label htmlFor="edit-user-email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('adminUsers.email')}
          </label>
          <input
            id="edit-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full ${FIELD}`}
            data-testid="edit-user-email"
            required
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.roles')}</legend>
          <div className="space-y-1">
            {ALL_ROLES.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={roles.includes(value)}
                  onChange={() => toggleRole(value)}
                  data-testid={`edit-user-role-${value}`}
                />
                {t(`roles.${value}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="edit-user-status" className="block text-sm font-medium text-gray-700 mb-1">
            {t('adminUsers.status')}
          </label>
          <select
            id="edit-user-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            className={`w-full ${FIELD}`}
            data-testid="edit-user-status"
          >
            <option value="active">{t('adminUsers.statusActive')}</option>
            <option value="suspended">{t('adminUsers.statusSuspended')}</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving} data-testid="edit-user-cancel">
            {t('adminUsers.cancel')}
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={saving || roles.length === 0}
            data-testid="edit-user-save"
          >
            {saving ? t('adminUsers.saving') : t('adminUsers.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
