export type BookStatus = 'to_read' | 'reading' | 'read';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  pages?: number | null;
  language?: string | null;
  description?: string | null;
  rating?: number | null;
  notes?: string | null;
  coverUrl?: string | null;
  status: BookStatus;
  startedAt?: string | null;
  finishedAt?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: string;
  description?: string;
  rating?: number;
  notes?: string;
  coverUrl?: string;
}

// `null` clears an optional field on the API.
export type UpdateBookRequest = {
  [K in keyof CreateBookRequest]?: CreateBookRequest[K] | null;
} & { status?: BookStatus };

export interface BooksListResponse {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Stats {
  stats: {
    total: number;
    byStatus: {
      toRead: number;
      reading: number;
      read: number;
    };
    averageRating: number;
    totalPages: number;
    booksWithRating: number;
  };
}