import { parseJsonOrThrow } from './http'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface SharedBookmark {
  id: string
  url: string
  title: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface SharedCollectionView {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  bookmarks: SharedBookmark[]
}

// Deliberately doesn't go through apiFetch: that helper always calls
// auth0Client.getTokenSilently() first, which would fail (or trigger a login
// redirect) for a visitor who was never logged in at all -- the entire point
// of a public share link is that no session is required.
export function getSharedView(token: string): Promise<SharedCollectionView> {
  return fetch(`${API_BASE_URL}/shared/${token}`).then(parseJsonOrThrow)
}
