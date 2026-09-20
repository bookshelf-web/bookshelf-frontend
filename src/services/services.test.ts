import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import api from './api'
import { authService } from './auth.service'
import { booksService } from './books.service'
import { companiesService } from './companies.service'
import { adminCatalogService } from './adminCatalog.service'
import { adminUsersService } from './adminUsers.service'
import { meService } from './me.service'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const http = api as unknown as Record<'get' | 'post' | 'put' | 'patch' | 'delete', Mock>

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('authService', () => {
  it('posts credentials and returns the response body', async () => {
    http.post.mockResolvedValue({ data: { token: 't', user: { id: 'u1' } } })

    const result = await authService.login({ email: 'a@b.co', password: 'x' })

    expect(http.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.co', password: 'x' })
    expect(result).toEqual({ token: 't', user: { id: 'u1' } })
  })

  it('registers with the chosen roles', async () => {
    http.post.mockResolvedValue({ data: { token: 't' } })

    await authService.register({ name: 'Ana', email: 'a@b.co', password: 'secret1', roles: ['reader', 'buyer'] })

    expect(http.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Ana',
      email: 'a@b.co',
      password: 'secret1',
      roles: ['reader', 'buyer'],
    })
  })

  it('manages the stored session', () => {
    localStorage.setItem('token', 'abc')
    localStorage.setItem('user', '{}')

    expect(authService.getToken()).toBe('abc')
    expect(authService.isAuthenticated()).toBe(true)

    authService.logout()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(authService.isAuthenticated()).toBe(false)
  })
})

describe('booksService', () => {
  it('lists books with the query params', async () => {
    http.get.mockResolvedValue({ data: { books: [], pagination: {} } })

    await booksService.getBooks({ page: 2, limit: 9, status: 'reading' })

    expect(http.get).toHaveBeenCalledWith('/books', { params: { page: 2, limit: 9, status: 'reading' } })
  })

  it('lists books without params', async () => {
    http.get.mockResolvedValue({ data: {} })

    await booksService.getBooks()

    expect(http.get).toHaveBeenCalledWith('/books', { params: {} })
  })

  it.each([
    ['getBookById', () => booksService.getBookById('b1'), 'get', ['/books/b1']],
    ['createBook', () => booksService.createBook({ title: 'T', author: 'A' }), 'post', ['/books', { title: 'T', author: 'A' }]],
    ['updateBook', () => booksService.updateBook('b1', { title: 'N' }), 'put', ['/books/b1', { title: 'N' }]],
    ['updateBookStatus', () => booksService.updateBookStatus('b1', 'read'), 'patch', ['/books/b1/status', { status: 'read' }]],
    ['deleteBook', () => booksService.deleteBook('b1'), 'delete', ['/books/b1']],
    ['getStats', () => booksService.getStats(), 'get', ['/stats']],
  ] as const)('%s calls the right endpoint and unwraps the body', async (_name, call, method, args) => {
    http[method].mockResolvedValue({ data: { ok: true } })

    expect(await call()).toEqual({ ok: true })
    expect(http[method]).toHaveBeenCalledWith(...args)
  })
})

describe('adminUsersService', () => {
  it('lists users with the query', async () => {
    http.get.mockResolvedValue({ data: { users: [], pagination: {} } })

    await adminUsersService.list({ page: 2, search: 'ana', role: 'seller', status: 'suspended' })

    expect(http.get).toHaveBeenCalledWith('/admin/users', {
      params: { page: 2, search: 'ana', role: 'seller', status: 'suspended' },
    })
  })

  it('lists without a query', async () => {
    http.get.mockResolvedValue({ data: {} })

    await adminUsersService.list()

    expect(http.get).toHaveBeenCalledWith('/admin/users', { params: {} })
  })

  it('updates a user and unwraps the account', async () => {
    http.patch.mockResolvedValue({ data: { user: { id: 'u1', status: 'suspended' } } })

    const user = await adminUsersService.update('u1', { status: 'suspended' })

    expect(http.patch).toHaveBeenCalledWith('/admin/users/u1', { status: 'suspended' })
    expect(user.status).toBe('suspended')
  })
})

describe('adminCatalogService', () => {
  it('lists the books and revisions waiting for a decision', async () => {
    http.get.mockResolvedValue({ data: { books: [], revisions: [], pagination: {} } })

    await adminCatalogService.listPendingBooks()
    await adminCatalogService.listPendingRevisions()

    expect(http.get).toHaveBeenNthCalledWith(1, '/admin/catalog/books', {
      params: { review: 'pending_review', status: 'active', limit: 50 },
    })
    await adminCatalogService.listPendingBooks('clean')
    expect(http.get).toHaveBeenLastCalledWith('/admin/catalog/books', {
      params: { review: 'pending_review', status: 'active', limit: 50, search: 'clean' },
    })
    expect(http.get).toHaveBeenNthCalledWith(2, '/admin/catalog/revisions', {
      params: { status: 'pending', limit: 50 },
    })
  })

  it('confirms a book and toggles its visibility', async () => {
    http.post.mockResolvedValue({ data: { book: { id: 'b1', reviewStatus: 'reviewed' } } })
    http.patch.mockResolvedValue({ data: { book: { id: 'b1', status: 'hidden' } } })

    expect((await adminCatalogService.confirmBook('b1')).reviewStatus).toBe('reviewed')
    expect(http.post).toHaveBeenCalledWith('/admin/catalog/books/b1/review')

    await adminCatalogService.setHidden('b1', true, 'nonsense')
    await adminCatalogService.setHidden('b1', false)
    expect(http.patch).toHaveBeenNthCalledWith(1, '/admin/catalog/books/b1/visibility', { hidden: true, reason: 'nonsense' })
    expect(http.patch).toHaveBeenNthCalledWith(2, '/admin/catalog/books/b1/visibility', { hidden: false })
  })

  it('decides a revision with an optional note', async () => {
    http.post.mockResolvedValue({ data: { revision: { id: 'r1', status: 'approved' } } })

    await adminCatalogService.decideRevision('r1', 'approve', 'ok')
    await adminCatalogService.decideRevision('r1', 'reject')

    expect(http.post).toHaveBeenNthCalledWith(1, '/admin/catalog/revisions/r1/decision', { decision: 'approve', note: 'ok' })
    expect(http.post).toHaveBeenNthCalledWith(2, '/admin/catalog/revisions/r1/decision', { decision: 'reject' })
  })
})

describe('meService', () => {
  it('loads the profile', async () => {
    http.get.mockResolvedValue({ data: { user: { id: 'u1' }, companies: [] } })

    expect(await meService.getProfile()).toEqual({ user: { id: 'u1' }, companies: [] })
    expect(http.get).toHaveBeenCalledWith('/me')
  })

  it('updates the profile name', async () => {
    http.patch.mockResolvedValue({ data: { token: 't', user: { name: 'Ana Souza' } } })

    const result = await meService.updateProfile('Ana Souza')

    expect(http.patch).toHaveBeenCalledWith('/me/profile', { name: 'Ana Souza' })
    expect(result.user.name).toBe('Ana Souza')
  })

  it('changes the password', async () => {
    http.patch.mockResolvedValue({ data: { message: 'ok' } })

    await meService.changePassword('old-pass', 'new-pass')

    expect(http.patch).toHaveBeenCalledWith('/me/password', { currentPassword: 'old-pass', newPassword: 'new-pass' })
  })

  it('updates roles and returns the fresh session', async () => {
    http.patch.mockResolvedValue({ data: { token: 'new', user: { roles: ['buyer'] } } })

    const result = await meService.updateRoles({ add: ['buyer'], remove: ['reader'] })

    expect(http.patch).toHaveBeenCalledWith('/me/roles', { add: ['buyer'], remove: ['reader'] })
    expect(result.token).toBe('new')
  })
})

describe('companiesService', () => {
  it('creates a company', async () => {
    http.post.mockResolvedValue({ data: { message: 'ok', company: { id: 'c1' } } })

    const result = await companiesService.create({
      cnpj: '11222333000181',
      legalName: 'Sebo',
      email: 'a@b.co',
      address: { street: 'R', number: '1', district: 'C', city: 'X', state: 'SP', zip: '01001000' },
    })

    expect(result.company.id).toBe('c1')
    expect(http.post).toHaveBeenCalledWith('/companies', expect.objectContaining({ cnpj: '11222333000181' }))
  })

  it('lists the companies of the user', async () => {
    http.get.mockResolvedValue({ data: { companies: [{ id: 'c1' }] } })

    expect(await companiesService.listMine()).toEqual([{ id: 'c1' }])
    expect(http.get).toHaveBeenCalledWith('/companies')
  })

  it('lists companies for an admin, optionally filtered', async () => {
    http.get.mockResolvedValue({ data: { companies: [] } })

    await companiesService.listForAdmin()
    await companiesService.listForAdmin(false)

    expect(http.get).toHaveBeenNthCalledWith(1, '/admin/companies', { params: {} })
    expect(http.get).toHaveBeenNthCalledWith(2, '/admin/companies', { params: { verified: false } })
  })

  it('sets the verification of a company', async () => {
    http.patch.mockResolvedValue({ data: { company: { id: 'c1', verified: true } } })

    const company = await companiesService.setVerified('c1', true)

    expect(http.patch).toHaveBeenCalledWith('/admin/companies/c1/verification', { verified: true })
    expect(company.verified).toBe(true)
  })
})
