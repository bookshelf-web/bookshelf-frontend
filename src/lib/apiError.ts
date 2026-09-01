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
  | 'CONFLICT'
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
