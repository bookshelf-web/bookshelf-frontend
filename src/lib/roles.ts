import type { Role, SelfServiceRole, User } from '../types/auth'

export const SELF_SERVICE_ROLES: SelfServiceRole[] = ['reader', 'buyer', 'seller']

/** Sessions stored before roles existed were library-only. */
export function rolesOf(user: Pick<User, 'roles'> | null | undefined): Role[] {
  return user?.roles?.length ? user.roles : ['reader']
}

/** Where a user lands after signing in: the library if they have one, otherwise their account. */
export function homePathFor(roles: Role[]): string {
  return roles.includes('reader') ? '/dashboard' : '/account'
}

/** Formats 14 digits as a CNPJ; anything else is returned unchanged. */
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.length === 14
    ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    : value
}
