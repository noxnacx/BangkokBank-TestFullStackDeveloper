import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { auth0Client } from './auth0Client'

interface AuthUser {
  sub?: string
  name?: string
  email?: string
}

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>
  logout: () => void
  // The access token is never kept in React state or any component prop --
  // it's pulled fresh from auth0-spa-js's own in-memory cache on every call,
  // so there's no extra place (React DevTools, component tree) it could leak
  // through beyond the SDK's own cache.
  getAccessToken: () => Promise<string>
  // Re-reads auth0Client's cache into React state. AuthProvider wraps the
  // whole app and never remounts on route changes, so the one-time mount
  // effect below can't see a login that completed on /callback -- that page
  // calls this once the token exchange succeeds, otherwise the UI would be
  // stuck showing "logged out" despite a valid cached token.
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
  })

  async function refresh() {
    try {
      // The token cache is memory-only, so a hard refresh always starts
      // empty. This attempts a silent re-auth against Auth0's own session
      // cookie (via a hidden iframe) to get a fresh token without forcing
      // a full login every time the page reloads. If there's no Auth0
      // session (never logged in, or it expired), this rejects and we just
      // fall back to "logged out" -- that's expected, not an error. A short
      // timeout here (default is 60s) keeps a slow/unreachable Auth0 tenant
      // from leaving the user stuck on a loading spinner.
      await auth0Client.getTokenSilently({ timeoutInSeconds: 5 })
      const user = await auth0Client.getUser()
      setState({ isLoading: false, isAuthenticated: true, user: user ?? null })
    } catch {
      setState({ isLoading: false, isAuthenticated: false, user: null })
    }
  }

  useEffect(() => {
    void refresh()
    // Deliberately no cleanup/cancellation guard: `state` only flows to a
    // component that's mounted for the app's entire lifetime (AuthProvider
    // wraps everything and is never unmounted), so there's no unmounted-
    // component race to guard against here.
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: () => auth0Client.loginWithRedirect(),
      logout: () => {
        auth0Client.logout({ logoutParams: { returnTo: window.location.origin } })
      },
      getAccessToken: () => auth0Client.getTokenSilently(),
      refresh,
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
