import { describe, expect, it } from 'vitest'
import { formatBRL, parseBRLToCents } from './money'

describe('formatBRL', () => {
  it('formats cents as Brazilian reais', () => {
    expect(formatBRL(2590).replace(/\s/g, ' ')).toBe('R$ 25,90')
    expect(formatBRL(0).replace(/\s/g, ' ')).toBe('R$ 0,00')
  })
})

describe('parseBRLToCents', () => {
  it.each([
    ['25,90', 2590],
    ['25.9', 2590],
    ['25', 2500],
    ['R$ 1.250,00', 125000],
    ['0,5', 50],
  ])('reads %s as %d cents', (input, cents) => {
    expect(parseBRLToCents(input)).toBe(cents)
  })

  it.each(['', 'abc', '1,234', '-5', '1,2,3'])('rejects %j', (input) => {
    expect(parseBRLToCents(input)).toBeNull()
  })
})
