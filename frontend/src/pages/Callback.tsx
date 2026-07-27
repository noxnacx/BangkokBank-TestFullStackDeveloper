import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, CircularProgress, Stack } from '@mui/material'
import { auth0Client } from '../auth/auth0Client'
import { useAuth } from '../auth/AuthProvider'

export default function Callback() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeLogin() {
      try {
        // Exchanges the `code` in the URL for tokens, using the
        // `code_verifier` auth0-spa-js stashed before the redirect. This is
        // the PKCE half of the flow: Auth0 hashes the verifier (S256) and
        // checks it against the `code_challenge` sent when the login
        // started, proving this is the same client that initiated it --
        // without that, a stolen authorization code would be useless on
        // its own.
        const result = await auth0Client.handleRedirectCallback()
        // AuthProvider computed its "logged out" state before this login
        // ever started and doesn't remount on navigation, so nothing
        // updates it automatically -- this pulls the token this call just
        // cached into the app's auth state.
        await refresh()
        navigate(result.appState?.returnTo ?? '/', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
    }
    void completeLogin()
  }, [navigate, refresh])

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Stack sx={{ alignItems: 'center', py: 8 }}>
      <CircularProgress />
    </Stack>
  )
}
