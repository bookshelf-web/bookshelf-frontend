export interface CatalogBook {
  id: string;
  isbn?: string | null;
  title: string;
  author: string;
  publisher?: string | null;
  publishedYear?: number | null;
  edition?: string | null;
  pages?: number | null;
  language?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  status: 'active' | 'hidden';
  reviewStatus: 'pending_review' | 'reviewed';
  createdAt: string;
}

export type RevisionChanges = Record<string, { from: unknown; to: unknown }>;

export interface CatalogRevision {
  id: string;
  catalogBookId: string;
  proposedBy: string;
  changes: RevisionChanges;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string | null;
  createdAt: string;
  book: CatalogBook | null;
}

export interface Paginated {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
