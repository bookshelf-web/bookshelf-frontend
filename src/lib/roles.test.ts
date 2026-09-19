import { describe, expect, it } from 'vitest'
import { formatCnpj, homePathFor, rolesOf, SELF_SERVICE_ROLES } from './roles'
import type { User } from '../types/auth'

const user = (roles?: User['roles']) => ({ roles }) as Pick<User, 'roles'>

describe('rolesOf', () => {
  it('returns the roles of the user', () => {
    expect(rolesOf(user(['buyer', 'seller']))).toEqual(['buyer', 'seller'])
  })

  it.each([[null], [undefined], [user(undefined)], [user([])]])(
    'treats %p as library-only, as sessions were before roles existed',
    (value) => {
      expect(rolesOf(value)).toEqual(['reader'])
    },
  )
})

describe('homePathFor', () => {
  it('opens the library for readers and the account page for everyone else', () => {
    expect(homePathFor(['reader'])).toBe('/dashboard')
    expect(homePathFor(['reader', 'seller'])).toBe('/dashboard')
    expect(homePathFor(['buyer'])).toBe('/account')
    expect(homePathFor(['admin'])).toBe('/account')
  })
})

describe('formatCnpj', () => {
  it('formats 14 digits and leaves other input alone', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81')
    expect(formatCnpj('11.222.333/0001-81')).toBe('11.222.333/0001-81')
    expect(formatCnpj('123')).toBe('123')
  })
})

describe('SELF_SERVICE_ROLES', () => {
  it('never includes admin', () => {
    expect(SELF_SERVICE_ROLES).toEqual(['reader', 'buyer', 'seller'])
  })
})
