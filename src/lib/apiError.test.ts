import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, getApiFieldErrors } from './apiError'

const apiError = (data: unknown) => ({ response: { data } })

describe('getApiErrorMessage', () => {
  it('joins field-level validation details', () => {
    const err = apiError({
      code: 'VALIDATION_ERROR',
      error: 'Validation failed',
      details: [
        { path: 'title', message: 'Title is required' },
        { path: 'author', message: 'Author is required' },
      ],
    })
    expect(getApiErrorMessage(err)).toBe('Title is required; Author is required')
  })

  it('localises known error codes', () => {
    expect(getApiErrorMessage(apiError({ code: 'EMAIL_ALREADY_REGISTERED', error: 'x' }))).toBe(
      'Este e-mail já está cadastrado.',
    )
  })

  it('falls back to the backend message, then the error message, then the fallback key', () => {
    expect(getApiErrorMessage(apiError({ error: 'Something odd' }))).toBe('Something odd')
    expect(getApiErrorMessage(new Error('Network Error'))).toBe('Network Error')
    expect(getApiErrorMessage({}, 'dashboard.loadError')).toBe('Erro ao carregar dados')
  })
})

describe('getApiFieldErrors', () => {
  it('maps details to a field -> message record keeping the first message per field', () => {
    const err = apiError({
      details: [
        { path: 'title', message: 'first' },
        { path: 'title', message: 'second' },
        { path: 'pages', message: 'bad' },
      ],
    })
    expect(getApiFieldErrors(err)).toEqual({ title: 'first', pages: 'bad' })
  })

  it('returns undefined without details', () => {
    expect(getApiFieldErrors(apiError({ error: 'x' }))).toBeUndefined()
  })
})
