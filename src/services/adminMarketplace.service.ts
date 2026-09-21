import api from './api';
import type { Paginated } from '../types/catalog';
import type { Listing, ListingStatus, Order, OrderStatus } from '../types/marketplace';

export const adminMarketplaceService = {
  async orders(params: { status?: OrderStatus; search?: string; page?: number }): Promise<{ orders: Order[]; pagination: Paginated }> {
    const response = await api.get<{ orders: Order[]; pagination: Paginated }>('/admin/marketplace/orders', {
      params: { limit: 20, ...params },
    });
    return response.data;
  },

  async listings(status?: ListingStatus, page = 1): Promise<{ listings: Listing[]; pagination: Paginated }> {
    const response = await api.get<{ listings: Listing[]; pagination: Paginated }>('/admin/marketplace/listings', {
      params: { limit: 20, page, ...(status && { status }) },
    });
    return response.data;
  },

  async removeListing(id: string, reason?: string): Promise<Listing> {
    const response = await api.post<{ listing: Listing }>(`/admin/marketplace/listings/${id}/remove`, {
      ...(reason && { reason }),
    });
    return response.data.listing;
  },
};
