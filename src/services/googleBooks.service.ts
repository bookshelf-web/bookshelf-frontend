import axios from 'axios';

// Public, keyless endpoint that allows browser (CORS) requests. Kept on its own
// axios instance so the API's Authorization header is never sent to Google.
const client = axios.create({ baseURL: 'https://www.googleapis.com/books/v1' });

const MAX_RESULTS = 8;

export interface BookSuggestion {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: string;
  description?: string;
  coverUrl?: string;
}

interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    language?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

function pickIsbn(identifiers: { type: string; identifier: string }[] | undefined): string | undefined {
  const isbn13 = identifiers?.find((item) => item.type === 'ISBN_13');
  const isbn10 = identifiers?.find((item) => item.type === 'ISBN_10');
  return (isbn13 ?? isbn10)?.identifier;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mapVolume(volume: GoogleVolume): BookSuggestion | null {
  const info = volume.volumeInfo;
  if (!info?.title) return null;

  const year = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : NaN;
  const cover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
  const description = info.description ? stripHtml(info.description) : '';

  return {
    id: volume.id,
    title: info.title,
    author: info.authors?.join(', ') ?? '',
    isbn: pickIsbn(info.industryIdentifiers),
    publisher: info.publisher,
    publishedYear: Number.isNaN(year) ? undefined : year,
    pages: info.pageCount && info.pageCount > 0 ? info.pageCount : undefined,
    language: info.language,
    description: description || undefined,
    // Google serves covers over http; force https to avoid mixed-content blocking.
    coverUrl: cover?.replace(/^http:\/\//, 'https://'),
  };
}

/** Turns a free-text query into a Google Books `q`; ISBN-looking input is searched as an ISBN. */
export function buildQuery(input: string): string {
  const query = input.trim();
  const digits = query.replace(/[-\s]/g, '');
  return /^(\d{10}|\d{13})$/.test(digits) ? `isbn:${digits}` : query;
}

export const googleBooksService = {
  async search(input: string): Promise<BookSuggestion[]> {
    const response = await client.get<{ items?: GoogleVolume[] }>('/volumes', {
      params: { q: buildQuery(input), maxResults: MAX_RESULTS, printType: 'books' },
    });
    return (response.data.items ?? [])
      .map(mapVolume)
      .filter((suggestion): suggestion is BookSuggestion => suggestion !== null);
  },
};
