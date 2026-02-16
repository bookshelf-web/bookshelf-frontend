import api from './api';
import type {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  BooksListResponse,
  BookStatus,
  Stats,
} from '../types/book';

interface GetBooksParams {
  page?: number;
  limit?: number;
  status?: BookStatus;
  rating?: number;
  search?: string;
  title?: string;
  author?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const booksService = {
  async getBooks(params: GetBooksParams = {}): Promise<BooksListResponse> {
    const response = await api.get<BooksListResponse>('/books', { params });
    return response.data;
  },

  async getBookById(id: string): Promise<{ book: Book }> {
    const response = await api.get<{ book: Book }>(`/books/${id}`);
    return response.data;
  },

  async createBook(data: CreateBookRequest): Promise<{ message: string; book: Book }> {
    const response = await api.post<{ message: string; book: Book }>('/books', data);
    return response.data;
  },

  async updateBook(
    id: string,
    data: UpdateBookRequest
  ): Promise<{ message: string; book: Book }> {
    const response = await api.put<{ message: string; book: Book }>(`/books/${id}`, data);
    return response.data;
  },

  async updateBookStatus(
    id: string,
    status: BookStatus
  ): Promise<{ message: string; book: Book }> {
    const response = await api.patch<{ message: string; book: Book }>(
      `/books/${id}/status`,
      { status }
    );
    return response.data;
  },

  async deleteBook(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/books/${id}`);
    return response.data;
  },

  async getStats(): Promise<Stats> {
    const response = await api.get<Stats>('/stats');
    return response.data;
  },
};