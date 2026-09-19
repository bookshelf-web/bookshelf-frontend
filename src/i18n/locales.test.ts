import { describe, expect, it } from 'vitest'
import ptBR from './locales/pt-BR'
import en from './locales/en'

function entriesOf(value: unknown, prefix = ''): [string, unknown][] {
  if (typeof value !== 'object' || value === null) return [[prefix, value]]
  return Object.entries(value).flatMap(([key, child]) =>
    entriesOf(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('locales', () => {
  it('define the same keys in every language', () => {
    const keys = (locale: unknown) => entriesOf(locale).map(([key]) => key).sort()
    expect(keys(en)).toEqual(keys(ptBR))
  })

  it('have no empty strings', () => {
    const empty = (locale: unknown) =>
      entriesOf(locale)
        .filter(([, value]) => value === '')
        .map(([key]) => key)
    expect(empty(ptBR)).toEqual([])
    expect(empty(en)).toEqual([])
  })
})
