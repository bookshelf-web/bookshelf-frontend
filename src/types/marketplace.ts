import type { Paginated } from './catalog';

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type ListingStatus = 'active' | 'paused' | 'removed';
export type OrderStatus = 'awaiting_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type ShippingMethod = 'ship' | 'pickup';
export type PaymentMethod = 'pix' | 'card';

export const LISTING_CONDITIONS: ListingCondition[] = ['new', 'like_new', 'good', 'fair', 'poor'];

export interface Listing {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    isbn?: string | null;
    publisher?: string | null;
    publishedYear?: number | null;
    edition?: string | null;
    coverUrl?: string | null;
  };
  priceCents: number;
  condition: ListingCondition;
  quantity: number;
  shippingFeeCents: number;
  pickupAvailable: boolean;
  pickupNote: string | null;
  description: string | null;
  status: ListingStatus;
  seller: { id: string; name: string; company: boolean };
  createdAt: string;
}

export interface ListingsQuery {
  search?: string;
  condition?: ListingCondition;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface CreateListingRequest {
  catalogBookId: string;
  priceCents: number;
  condition: ListingCondition;
  quantity: number;
  shippingFeeCents: number;
  pickupAvailable: boolean;
  pickupNote?: string | null;
  description?: string | null;
  companyId?: string | null;
}

export type UpdateListingRequest = Partial<
  Pick<CreateListingRequest, 'priceCents' | 'quantity' | 'shippingFeeCents' | 'pickupAvailable' | 'condition'>
> & { status?: 'active' | 'paused' };

export interface ShippingAddress {
  recipient: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zip: string;
}

export interface CreateOrderRequest {
  items: Array<{ listingId: string; quantity: number }>;
  shippingMethod: ShippingMethod;
  shippingAddress?: ShippingAddress;
}

export interface Charge {
  id: string;
  simulated: boolean;
  method: PaymentMethod;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  amountCents: number;
  failureReason?: 'declined' | 'insufficient_funds' | 'not_a_test_card' | null;
  pix?: { code: string; expiresAt: string } | null;
  card?: { brand: string | null; last4: string } | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  listingId: string;
  catalogBookId: string;
  title: string;
  author: string;
  isbn?: string | null;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress | null;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  trackingCode: string | null;
  cancelReason: 'buyer' | 'expired' | null;
  items: OrderItem[];
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  payment: Charge | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface Page<T> {
  pagination: Paginated;
  items: T[];
}
