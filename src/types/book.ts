export type BookStatus = 'to_read' | 'reading' | 'read';

export interface Book {
  id: string;
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
  status: BookStatus;
  startedAt?: string;
  finishedAt?: string;
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

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  status?: BookStatus;
}

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