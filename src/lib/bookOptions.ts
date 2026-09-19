import type { BookStatus } from '../types/book'

export const BOOK_STATUSES: BookStatus[] = ['to_read', 'reading', 'read']

export const SORT_OPTIONS = {
  newest: { sortBy: 'createdAt', sortOrder: 'DESC' },
  oldest: { sortBy: 'createdAt', sortOrder: 'ASC' },
  title: { sortBy: 'title', sortOrder: 'ASC' },
  author: { sortBy: 'author', sortOrder: 'ASC' },
  rating: { sortBy: 'rating', sortOrder: 'DESC' },
} as const

export type SortKey = keyof typeof SORT_OPTIONS
