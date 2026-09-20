import api from './api';
import type { CatalogBook, Paginated } from '../types/catalog';

export const catalogService = {
  /** Active books of the shared catalog, by title/author or exact ISBN. */
  async search(search: string): Promise<{ books: CatalogBook[]; pagination: Paginated }> {
    const response = await api.get<{ books: CatalogBook[]; pagination: Paginated }>('/catalog/books', {
      params: { search, limit: 8 },
    });
    return response.data;
  },
};
