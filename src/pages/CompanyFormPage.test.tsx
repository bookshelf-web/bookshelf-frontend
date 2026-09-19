import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CompanyFormPage } from './CompanyFormPage'
import { companiesService } from '../services/companies.service'

vi.mock('../services/companies.service', () => ({
  companiesService: { create: vi.fn() },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Ana', roles: ['seller'] },
    roles: ['seller'],
    hasRole: () => true,
    logout: vi.fn(),
  }),
}))

const service = vi.mocked(companiesService)

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/companies/new']}>
      <Routes>
        <Route path="/companies/new" element={<CompanyFormPage />} />
        <Route path="/account" element={<p>account page</p>} />
      </Routes>
    </MemoryRouter>,
  )

async function fillRequired() {
  await userEvent.type(screen.getByTestId('company-cnpj-input'), '11.222.333/0001-81')
  await userEvent.type(screen.getByTestId('company-legalName-input'), 'Sebo Página Viva LTDA')
  await userEvent.type(screen.getByTestId('company-email-input'), 'contato@paginaviva.test')
  await userEvent.type(screen.getByTestId('company-street-input'), 'Rua dos Livros')
  await userEvent.type(screen.getByTestId('company-number-input'), '100')
  await userEvent.type(screen.getByTestId('company-district-input'), 'Centro')
  await userEvent.type(screen.getByTestId('company-city-input'), 'São Paulo')
  await userEvent.selectOptions(screen.getByTestId('company-state-input'), 'SP')
  await userEvent.type(screen.getByTestId('company-zip-input'), '01001-000')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CompanyFormPage', () => {
  it('offers every Brazilian state', () => {
    renderPage()

    const options = screen.getByTestId('company-state-input').querySelectorAll('option')
    expect(options).toHaveLength(28)
  })

  it('submits only the filled fields and goes back to the account page', async () => {
    service.create.mockResolvedValue({ message: 'ok', company: {} as never })
    renderPage()

    await fillRequired()
    await userEvent.click(screen.getByTestId('company-submit-button'))

    expect(service.create).toHaveBeenCalledWith({
      cnpj: '11.222.333/0001-81',
      legalName: 'Sebo Página Viva LTDA',
      email: 'contato@paginaviva.test',
      address: {
        street: 'Rua dos Livros',
        number: '100',
        district: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip: '01001-000',
      },
    })
    expect(await screen.findByText('account page')).toBeInTheDocument()
  })

  it('includes the optional fields when filled', async () => {
    service.create.mockResolvedValue({ message: 'ok', company: {} as never })
    renderPage()

    await fillRequired()
    await userEvent.type(screen.getByTestId('company-tradeName-input'), 'Página Viva')
    await userEvent.type(screen.getByTestId('company-phone-input'), '(11) 91234-5678')
    await userEvent.type(screen.getByTestId('company-complement-input'), 'Sala 2')
    await userEvent.click(screen.getByTestId('company-submit-button'))

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tradeName: 'Página Viva',
        phone: '(11) 91234-5678',
        address: expect.objectContaining({ complement: 'Sala 2' }),
      }),
    )
  })

  it('shows the localised API error and stays on the form', async () => {
    service.create.mockRejectedValue({ response: { data: { code: 'CNPJ_ALREADY_REGISTERED', error: 'x' } } })
    renderPage()

    await fillRequired()
    await userEvent.click(screen.getByTestId('company-submit-button'))

    expect(await screen.findByTestId('company-form-error')).toHaveTextContent('Já existe uma empresa com este CNPJ.')
    expect(screen.queryByText('account page')).not.toBeInTheDocument()
    expect(screen.getByTestId('company-submit-button')).toBeEnabled()
  })

  it('shows field-level validation messages from the API', async () => {
    service.create.mockRejectedValue({
      response: {
        data: {
          code: 'VALIDATION_ERROR',
          error: 'CNPJ is invalid',
          details: [{ path: 'cnpj', message: 'CNPJ is invalid' }],
        },
      },
    })
    renderPage()

    await fillRequired()
    await userEvent.click(screen.getByTestId('company-submit-button'))

    expect(await screen.findByTestId('company-form-error')).toHaveTextContent('CNPJ is invalid')
  })

  it('links back to the account page', () => {
    renderPage()

    expect(screen.getByTestId('company-cancel-button')).toHaveAttribute('href', '/account')
  })
})
