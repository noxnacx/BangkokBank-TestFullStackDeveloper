import { apiFetch } from './client'
import { parseJsonOrThrow } from './http'

export interface Bookmark {
  id: string
  url: string
  title: string
  notes: string | null
  ownerId: string
  collectionId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBookmarkInput {
  url: string
  title: string
  notes?: string
  collectionId?: string
}

// No server-side collectionId filter is used here on purpose -- the backend
// only supports filtering to one real collection, not an "uncategorized"
// concept, and the page needs both. Fetching the full list once and
// filtering client-side (see Bookmarks.tsx) covers both cases with one code
// path instead of two.
export function listBookmarks(): Promise<Bookmark[]> {
  return apiFetch('/bookmarks').then(parseJsonOrThrow)
}

export function getBookmark(id: string): Promise<Bookmark> {
  return apiFetch(`/bookmarks/${id}`).then(parseJsonOrThrow)
}

export function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  return apiFetch('/bookmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(parseJsonOrThrow)
}

export function deleteBookmark(id: string): Promise<void> {
  return apiFetch(`/bookmarks/${id}`, { method: 'DELETE' }).then(parseJsonOrThrow)
}
