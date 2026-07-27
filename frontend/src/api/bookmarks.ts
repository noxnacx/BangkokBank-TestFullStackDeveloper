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

export interface UpdateBookmarkInput {
  url: string
  title: string
  // Explicit `null` (not omitted) for both -- the edit form always submits
  // every field, and the backend's PATCH treats an omitted key as "leave
  // untouched" vs. `null` as "clear it". Since this form always has a
  // definite value for every field, there's no "leave untouched" case here.
  notes: string | null
  collectionId: string | null
}

export function updateBookmark(id: string, input: UpdateBookmarkInput): Promise<Bookmark> {
  return apiFetch(`/bookmarks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(parseJsonOrThrow)
}
