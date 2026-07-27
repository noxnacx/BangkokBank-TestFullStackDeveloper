import { apiFetch } from './client'
import { parseJsonOrThrow } from './http'

export interface Collection {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export function listCollections(): Promise<Collection[]> {
  return apiFetch('/collections').then(parseJsonOrThrow)
}

export function getCollection(id: string): Promise<Collection> {
  return apiFetch(`/collections/${id}`).then(parseJsonOrThrow)
}

export function createCollection(name: string): Promise<Collection> {
  return apiFetch('/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(parseJsonOrThrow)
}

export function deleteCollection(id: string): Promise<void> {
  return apiFetch(`/collections/${id}`, { method: 'DELETE' }).then(parseJsonOrThrow)
}

// PUT, not PATCH: Collection has exactly one user-settable field, and the
// edit form always submits a full value for it -- there's no "some fields
// omitted" case a PATCH would exist to handle.
export function updateCollection(id: string, name: string): Promise<Collection> {
  return apiFetch(`/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(parseJsonOrThrow)
}
