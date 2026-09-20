import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Listing } from '../types/marketplace'

const STORAGE_KEY = 'cart'

export interface CartLine {
  listing: Listing
  quantity: number
}

interface CartContextType {
  lines: CartLine[]
  count: number
  add: (listing: Listing) => void
  setQuantity: (listingId: string, quantity: number) => void
  remove: (listingId: string) => void
  /** Drops every line of a seller (after that seller's order was placed). */
  clearSeller: (sellerId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function readStored(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Storage may be blocked; the cart then lives only in memory.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStored)

  const value = useMemo<CartContextType>(() => {
    const change = (next: CartLine[]) => {
      setLines(next)
      persist(next)
    }
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add: (listing) => {
        const existing = lines.find((line) => line.listing.id === listing.id)
        if (!existing) return change([...lines, { listing, quantity: 1 }])
        change(
          lines.map((line) =>
            line.listing.id === listing.id
              ? { listing, quantity: Math.min(line.quantity + 1, listing.quantity) }
              : line,
          ),
        )
      },
      setQuantity: (listingId, quantity) =>
        change(
          lines.map((line) =>
            line.listing.id === listingId
              ? { ...line, quantity: Math.max(1, Math.min(quantity, line.listing.quantity)) }
              : line,
          ),
        ),
      remove: (listingId) => change(lines.filter((line) => line.listing.id !== listingId)),
      clearSeller: (sellerId) => change(lines.filter((line) => line.listing.seller.id !== sellerId)),
      clear: () => change([]),
    }
  }, [lines])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

/** For the header badge, which also renders on pages that never touch the cart. */
export function useCartCount(): number {
  return useContext(CartContext)?.count ?? 0
}
