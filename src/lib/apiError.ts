import i18n from '../i18n'

// Standardised API error body (after the backend refactor):
//   { error: "message in English", code: "MACHINE_CODE", details?: [...] }
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'ISBN_ALREADY_REGISTERED'
  | 'BOOK_NOT_FOUND'
  | 'TOKEN_MISSING'
  | 'TOKEN_MALFORMED'
  | 'INVALID_TOKEN'
  | 'ROUTE_NOT_FOUND'
  | 'ROLE_REQUIRED'
  | 'INVALID_ISBN'
  | 'BOOK_ALREADY_IN_LIBRARY'
  | 'CATALOG_DUPLICATE'
  | 'CATALOG_BOOK_HIDDEN'
  | 'CATALOG_BOOK_NOT_FOUND'
  | 'REVISION_NOT_FOUND'
  | 'REVISION_ALREADY_DECIDED'
  | 'CANNOT_SUSPEND_SELF'
  | 'LAST_ADMIN'
  | 'ACCOUNT_SUSPENDED'
  | 'INVALID_CURRENT_PASSWORD'
  | 'PASSWORD_UNCHANGED'
  | 'ROLE_REQUIRED_MINIMUM'
  | 'FORBIDDEN'
  | 'CNPJ_ALREADY_REGISTERED'
  | 'COMPANY_NOT_FOUND'
  | 'COMPANY_ROLE_REQUIRED'
  | 'COMPANY_OWNER_REQUIRED'
  | 'MEMBER_ALREADY_EXISTS'
  | 'MEMBER_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'OWNER_CANNOT_BE_REMOVED'
  | 'CONFLICT'
  | 'LISTING_NOT_FOUND'
  | 'LISTING_UNAVAILABLE'
  | 'INSUFFICIENT_STOCK'
  | 'SELF_PURCHASE'
  | 'MIXED_SELLERS'
  | 'PICKUP_UNAVAILABLE'
  | 'NOT_LISTING_OWNER'
  | 'COMPANY_NOT_VERIFIED'
  | 'ORDER_NOT_FOUND'
  | 'ORDER_NOT_PAYABLE'
  | 'ORDER_NOT_CANCELLABLE'
  | 'ORDER_NOT_SHIPPABLE'
  | 'ORDER_IS_PICKUP'
  | 'ORDER_NOT_DELIVERABLE'
  | 'NO_PENDING_PIX'
  | 'PAYMENTS_DISABLED'
  | 'CHARGE_EXPIRED'
  | 'CHARGE_NOT_PENDING'
  | 'INVALID_AMOUNT'
  | 'INTERNAL_ERROR'

export interface ApiErrorDetail {
  path: string
  message: string
}

export interface ApiErrorBody {
  error: string
  code?: ApiErrorCode
  details?: ApiErrorDetail[]
}

function getBody(err: unknown): Partial<ApiErrorBody> | undefined {
  return (err as { response?: { data?: Partial<ApiErrorBody> } })?.response?.data
}

/**
 * Resolves a user-facing message from an axios error, localised via i18n.
 * Priority: field-level validation details > mapped `code` > backend `error`
 * string > `err.message` > the fallback key.
 */
export function getApiErrorMessage(err: unknown, fallbackKey = 'apiErrors.generic'): string {
  const body = getBody(err)
  // The strict `t` signature rejects runtime-built keys; a plain string
  // signature is enough here.
  const t = i18n.t.bind(i18n) as (key: string) => string

  if (body?.code === 'VALIDATION_ERROR' && body.details?.length) {
    return body.details.map((detail) => detail.message).join('; ')
  }

  if (body?.code) {
    const key = `apiErrors.${body.code}`
    const translated = t(key)
    if (translated !== key) return translated
  }

  if (body?.error) return body.error

  const message = (err as { message?: string })?.message
  if (message) return message

  return t(fallbackKey)
}

/**
 * Maps `details` into a `{ field: message }` object for per-field form errors.
 * Returns `undefined` when the error carries no validation details.
 */
export function getApiFieldErrors(err: unknown): Record<string, string> | undefined {
  const details = getBody(err)?.details
  if (!details?.length) return undefined
  return details.reduce<Record<string, string>>((acc, detail) => {
    if (detail.path && !acc[detail.path]) acc[detail.path] = detail.message
    return acc
  }, {})
}
