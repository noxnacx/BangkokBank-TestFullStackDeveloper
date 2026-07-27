import { useState } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { useAuth } from '../auth/AuthProvider'
import { apiFetch } from '../api/client'

export default function Home() {
  const { isLoading, isAuthenticated, user } = useAuth()
  const [meResult, setMeResult] = useState<string | null>(null)
  const [meError, setMeError] = useState<string | null>(null)

  async function callMe() {
    setMeError(null)
    setMeResult(null)
    try {
      const res = await apiFetch('/me')
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
      }
      setMeResult(JSON.stringify(await res.json()))
    } catch (err) {
      setMeError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  if (!isAuthenticated) {
    return <Typography variant="h4">Home — please log in</Typography>
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Home</Typography>
      <Typography>Logged in as {user?.name ?? user?.sub}</Typography>
      <Box>
        <Button variant="outlined" onClick={() => void callMe()}>
          Call GET /me (proves the Bearer token attaches)
        </Button>
      </Box>
      {meResult && <Alert severity="success">{meResult}</Alert>}
      {meError && <Alert severity="error">{meError}</Alert>}
    </Stack>
  )
}
