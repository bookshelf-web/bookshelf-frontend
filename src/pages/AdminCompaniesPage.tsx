import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { getApiErrorMessage } from '../lib/apiError'
import { formatCnpj } from '../lib/roles'
import { companiesService } from '../services/companies.service'
import type { Company } from '../types/company'

type Filter = 'all' | 'pending' | 'verified'

const FILTER_VALUE: Record<Filter, boolean | undefined> = {
  all: undefined,
  pending: false,
  verified: true,
}

const FILTER_LABEL = {
  all: 'adminCompanies.filterAll',
  pending: 'adminCompanies.filterPending',
  verified: 'adminCompanies.filterVerified',
} as const

interface Loaded {
  filter: Filter
  companies: Company[]
  error: string
}

export function AdminCompaniesPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Filter>('pending')
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    companiesService
      .listForAdmin(FILTER_VALUE[filter])
      .then((companies) => {
        if (!cancelled) setLoaded({ filter, companies, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setLoaded({ filter, companies: [], error: getApiErrorMessage(err, 'adminCompanies.loadError') })
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  const loading = loaded === null || loaded.filter !== filter

  const toggleVerification = async (company: Company) => {
    setBusyId(company.id)
    setActionError('')
    try {
      const updated = await companiesService.setVerified(company.id, !company.verified)
      setLoaded((current) => {
        if (!current) return current
        const stillListed = FILTER_VALUE[current.filter] === undefined || FILTER_VALUE[current.filter] === updated.verified
        return {
          ...current,
          companies: stillListed
            ? current.companies.map((item) => (item.id === updated.id ? updated : item))
            : current.companies.filter((item) => item.id !== updated.id),
        }
      })
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'adminCompanies.updateError'))
    } finally {
      setBusyId(null)
    }
  }

  const companies = loaded && !loading ? loaded.companies : []
  const error = actionError || (loaded && !loading ? loaded.error : '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="admin-companies-page">
      <AppHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('adminCompanies.title')}</h2>
          <p className="text-gray-600">{t('adminCompanies.subtitle')}</p>
        </div>

        <div className="flex gap-2" role="group" aria-label={t('adminCompanies.title')}>
          {(Object.keys(FILTER_LABEL) as Filter[]).map((key) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              data-testid={`admin-filter-${key}`}
            >
              {t(FILTER_LABEL[key])}
            </Button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert" data-testid="admin-error">
            {error}
          </p>
        )}

        {!loading && !error && companies.length === 0 ? (
          <p className="text-gray-500" data-testid="admin-companies-empty">
            {t('adminCompanies.empty')}
          </p>
        ) : (
          <ul className="space-y-3" data-testid="admin-companies-list" aria-busy={loading}>
            {companies.map((company) => (
              <li
                key={company.id}
                className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4"
                data-testid={`admin-company-${company.id}`}
              >
                <div>
                  <p className="font-semibold text-gray-900">{company.tradeName || company.legalName}</p>
                  <p className="text-sm text-gray-600">{company.legalName}</p>
                  <p className="text-sm text-gray-500">
                    {formatCnpj(company.cnpj)} · {company.address.city}/{company.address.state} · {company.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={company.verified ? 'outline' : 'default'}
                  onClick={() => toggleVerification(company)}
                  disabled={busyId === company.id}
                  data-testid={`verify-company-${company.id}`}
                >
                  {company.verified ? t('adminCompanies.revoke') : t('adminCompanies.verify')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
