import { auth0Client } from '../auth/auth0Client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Every call to the backend goes through here so the Bearer token is never
// something individual call sites have to remember to attach.
// `getTokenSilently()` returns the cached token, transparently renewing it
// first if it's expired -- callers never see that distinction.
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await auth0Client.getTokenSilently()
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
}
