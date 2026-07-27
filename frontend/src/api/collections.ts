import { apiFetch } from './client'

export interface Collection {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function parseJsonOrThrow(res: Response) {
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null)
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : res.statusText
    throw new ApiError(res.status, message)
  }
  return res.status === 204 ? undefined : res.json()
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
