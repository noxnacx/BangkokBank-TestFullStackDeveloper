import { useEffect, type ReactNode } from 'react'
import { CircularProgress, Stack } from '@mui/material'
import { useAuth } from './AuthProvider'

// Redirects to Auth0 login whenever a protected page is reached while
// logged out, instead of every page needing to remember to check this
// itself.
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, login } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void login()
    }
  }, [isLoading, isAuthenticated, login])

  if (isLoading || !isAuthenticated) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  return <>{children}</>
}
