import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { CartProvider, useCart, useCartCount } from './CartContext'
import type { Listing } from '../types/marketplace'

const listing = (id: string, overrides: Partial<Listing> = {}): Listing => ({
  id,
  book: { id: `b-${id}`, title: `Book ${id}`, author: 'Author' },
  priceCents: 2500,
  condition: 'good',
  quantity: 3,
  shippingFeeCents: 1000,
  pickupAvailable: true,
  pickupNote: null,
  description: null,
  status: 'active',
  seller: { id: 's1', name: 'Seller', company: false },
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>

beforeEach(() => localStorage.clear())

describe('CartContext', () => {
  it('adds a listing once and increases its quantity, never above the stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.add(listing('l1', { quantity: 2 })))
    act(() => result.current.add(listing('l1', { quantity: 2 })))
    act(() => result.current.add(listing('l1', { quantity: 2 })))

    expect(result.current.lines).toHaveLength(1)
    expect(result.current.lines[0].quantity).toBe(2)
    expect(result.current.count).toBe(2)
  })

  it('keeps the quantity between one and the stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(listing('l1')))

    act(() => result.current.setQuantity('l1', 99))
    expect(result.current.lines[0].quantity).toBe(3)

    act(() => result.current.setQuantity('l1', 0))
    expect(result.current.lines[0].quantity).toBe(1)
  })

  it('removes a line, a whole seller, or everything', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => result.current.add(listing('l1')))
    act(() => result.current.add(listing('l2')))
    act(() => result.current.add(listing('l3', { seller: { id: 's2', name: 'Other', company: true } })))

    act(() => result.current.remove('l1'))
    expect(result.current.lines.map((line) => line.listing.id)).toEqual(['l2', 'l3'])

    act(() => result.current.clearSeller('s1'))
    expect(result.current.lines.map((line) => line.listing.id)).toEqual(['l3'])

    act(() => result.current.clear())
    expect(result.current.lines).toEqual([])
  })

  it('survives a reload through localStorage', () => {
    const first = renderHook(() => useCart(), { wrapper })
    act(() => first.result.current.add(listing('l1')))
    first.unmount()

    const second = renderHook(() => useCart(), { wrapper })

    expect(second.result.current.lines).toHaveLength(1)
  })

  it('ignores a corrupted stored cart', () => {
    localStorage.setItem('cart', '{not json')
    expect(renderHook(() => useCart(), { wrapper }).result.current.lines).toEqual([])

    localStorage.setItem('cart', '"a string"')
    expect(renderHook(() => useCart(), { wrapper }).result.current.lines).toEqual([])
  })

  it('throws outside a provider, while the header count falls back to zero', () => {
    expect(() => renderHook(() => useCart())).toThrow('CartProvider')
    expect(renderHook(() => useCartCount()).result.current).toBe(0)
  })
})
