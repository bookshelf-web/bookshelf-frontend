import api from './api';
import type { CatalogBook, CatalogRevision, Paginated } from '../types/catalog';

export const adminCatalogService = {
  /** Books registered by readers that no admin has reviewed yet. */
  async listPendingBooks(search?: string): Promise<{ books: CatalogBook[]; pagination: Paginated }> {
    const response = await api.get<{ books: CatalogBook[]; pagination: Paginated }>('/admin/catalog/books', {
      params: { review: 'pending_review', status: 'active', limit: 50, ...(search && { search }) },
    });
    return response.data;
  },

  async confirmBook(id: string): Promise<CatalogBook> {
    const response = await api.post<{ book: CatalogBook }>(`/admin/catalog/books/${id}/review`);
    return response.data.book;
  },

  async setHidden(id: string, hidden: boolean, reason?: string): Promise<CatalogBook> {
    const response = await api.patch<{ book: CatalogBook }>(`/admin/catalog/books/${id}/visibility`, {
      hidden,
      ...(reason && { reason }),
    });
    return response.data.book;
  },

  async listPendingRevisions(): Promise<{ revisions: CatalogRevision[]; pagination: Paginated }> {
    const response = await api.get<{ revisions: CatalogRevision[]; pagination: Paginated }>(
      '/admin/catalog/revisions',
      { params: { status: 'pending', limit: 50 } },
    );
    return response.data;
  },

  async decideRevision(id: string, decision: 'approve' | 'reject', note?: string): Promise<CatalogRevision> {
    const response = await api.post<{ revision: CatalogRevision }>(`/admin/catalog/revisions/${id}/decision`, {
      decision,
      ...(note && { note }),
    });
    return response.data.revision;
  },
};
