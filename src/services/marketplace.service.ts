import api from './api';
import type { Paginated } from '../types/catalog';
import type {
  CreateListingRequest,
  CreateOrderRequest,
  Listing,
  ListingsQuery,
  Order,
  OrderStatus,
  PaymentMethod,
  UpdateListingRequest,
} from '../types/marketplace';

interface ListingsPage {
  listings: Listing[];
  pagination: Paginated;
}

interface OrdersPage {
  orders: Order[];
  pagination: Paginated;
}

export const marketplaceService = {
  async browse(query: ListingsQuery = {}): Promise<ListingsPage> {
    const response = await api.get<ListingsPage>('/marketplace/listings', { params: query });
    return response.data;
  },

  async myListings(page = 1): Promise<ListingsPage> {
    const response = await api.get<ListingsPage>('/marketplace/listings/mine', { params: { page, limit: 50 } });
    return response.data;
  },

  async createListing(data: CreateListingRequest): Promise<Listing> {
    const response = await api.post<{ listing: Listing }>('/marketplace/listings', data);
    return response.data.listing;
  },

  async updateListing(id: string, data: UpdateListingRequest): Promise<Listing> {
    const response = await api.patch<{ listing: Listing }>(`/marketplace/listings/${id}`, data);
    return response.data.listing;
  },

  async removeListing(id: string): Promise<void> {
    await api.delete(`/marketplace/listings/${id}`);
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post<{ order: Order }>('/marketplace/orders', data);
    return response.data.order;
  },

  async purchases(status?: OrderStatus, page = 1): Promise<OrdersPage> {
    const response = await api.get<OrdersPage>('/marketplace/orders', { params: { page, limit: 20, ...(status && { status }) } });
    return response.data;
  },

  async sales(status?: OrderStatus, page = 1): Promise<OrdersPage> {
    const response = await api.get<OrdersPage>('/marketplace/sales', { params: { page, limit: 20, ...(status && { status }) } });
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get<{ order: Order }>(`/marketplace/orders/${id}`);
    return response.data.order;
  },

  async pay(id: string, method: PaymentMethod, cardNumber?: string): Promise<Order> {
    const response = await api.post<{ order: Order }>(`/marketplace/orders/${id}/pay`, {
      method,
      ...(cardNumber && { cardNumber }),
    });
    return response.data.order;
  },

  async simulatePixPayment(id: string): Promise<Order> {
    const response = await api.post<{ order: Order }>(`/marketplace/orders/${id}/simulate-pix-payment`);
    return response.data.order;
  },

  async cancel(id: string): Promise<Order> {
    const response = await api.post<{ order: Order }>(`/marketplace/orders/${id}/cancel`);
    return response.data.order;
  },

  async ship(id: string, trackingCode: string): Promise<Order> {
    const response = await api.post<{ order: Order }>(`/marketplace/orders/${id}/ship`, { trackingCode });
    return response.data.order;
  },

  async deliver(id: string): Promise<Order> {
    const response = await api.post<{ order: Order }>(`/marketplace/orders/${id}/deliver`);
    return response.data.order;
  },
};
