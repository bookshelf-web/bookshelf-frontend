import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { AppHeader } from '../components/AppHeader'
import { getApiErrorMessage } from '../lib/apiError'
import { BRAZILIAN_STATES } from '../lib/brazil'
import { companiesService } from '../services/companies.service'
import type { CreateCompanyRequest } from '../types/company'

const INPUT_CLASS =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-1'

const EMPTY = {
  cnpj: '',
  legalName: '',
  tradeName: '',
  email: '',
  phone: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  zip: '',
}

type FormState = typeof EMPTY

export function CompanyFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const field = (name: keyof FormState) => ({
    id: `company-${name}`,
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [name]: e.target.value })),
    disabled: loading,
    'data-testid': `company-${name}-input`,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Optional fields are sent only when filled so the API stores them as absent.
    const payload: CreateCompanyRequest = {
      cnpj: form.cnpj,
      legalName: form.legalName,
      email: form.email,
      address: {
        street: form.street,
        number: form.number,
        district: form.district,
        city: form.city,
        state: form.state,
        zip: form.zip,
        ...(form.complement && { complement: form.complement }),
      },
      ...(form.tradeName && { tradeName: form.tradeName }),
      ...(form.phone && { phone: form.phone }),
    }

    try {
      await companiesService.create(payload)
      navigate('/account')
    } catch (err) {
      setError(getApiErrorMessage(err, 'companyForm.genericError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-testid="company-form-page">
      <AppHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('companyForm.title')}</h2>
            <p className="text-gray-600 text-sm mt-1">{t('companyForm.subtitle')}</p>
          </div>

          {error && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              role="alert"
              data-testid="company-form-error"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-cnpj" className={LABEL_CLASS}>{t('companyForm.cnpj')} *</label>
                <input
                  {...field('cnpj')}
                  type="text"
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  placeholder={t('companyForm.cnpjPlaceholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="company-legalName" className={LABEL_CLASS}>{t('companyForm.legalName')} *</label>
                <input {...field('legalName')} type="text" className={INPUT_CLASS} required />
              </div>
              <div>
                <label htmlFor="company-tradeName" className={LABEL_CLASS}>{t('companyForm.tradeName')}</label>
                <input {...field('tradeName')} type="text" className={INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor="company-email" className={LABEL_CLASS}>{t('companyForm.email')} *</label>
                <input {...field('email')} type="email" className={INPUT_CLASS} required />
              </div>
              <div>
                <label htmlFor="company-phone" className={LABEL_CLASS}>{t('companyForm.phone')}</label>
                <input
                  {...field('phone')}
                  type="tel"
                  className={INPUT_CLASS}
                  placeholder={t('companyForm.phonePlaceholder')}
                />
              </div>
            </div>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900">{t('companyForm.addressTitle')}</legend>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-4">
                  <label htmlFor="company-street" className={LABEL_CLASS}>{t('companyForm.street')} *</label>
                  <input {...field('street')} type="text" className={INPUT_CLASS} required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="company-number" className={LABEL_CLASS}>{t('companyForm.number')} *</label>
                  <input {...field('number')} type="text" className={INPUT_CLASS} required />
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="company-complement" className={LABEL_CLASS}>{t('companyForm.complement')}</label>
                  <input {...field('complement')} type="text" className={INPUT_CLASS} />
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="company-district" className={LABEL_CLASS}>{t('companyForm.district')} *</label>
                  <input {...field('district')} type="text" className={INPUT_CLASS} required />
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="company-city" className={LABEL_CLASS}>{t('companyForm.city')} *</label>
                  <input {...field('city')} type="text" className={INPUT_CLASS} required />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="company-state" className={LABEL_CLASS}>{t('companyForm.state')} *</label>
                  <select {...field('state')} className={INPUT_CLASS} required>
                    <option value="" />
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="company-zip" className={LABEL_CLASS}>{t('companyForm.zip')} *</label>
                  <input {...field('zip')} type="text" inputMode="numeric" className={INPUT_CLASS} required />
                </div>
              </div>
            </fieldset>

            <p className="text-xs text-gray-500">{t('companyForm.verifyNote')}</p>

            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/account" data-testid="company-cancel-button">
                  {t('common.cancel')}
                </Link>
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={loading}
                data-testid="company-submit-button"
              >
                {loading ? t('companyForm.submitting') : t('companyForm.submit')}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
