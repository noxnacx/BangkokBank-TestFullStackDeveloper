import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  CircularProgress,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { ApiError } from '../api/http'
import { getSharedView, type SharedCollectionView } from '../api/shared'

export default function Shared() {
  const { token } = useParams<{ token: string }>()
  const [view, setView] = useState<SharedCollectionView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const data = await getSharedView(token)
        if (!cancelled) setView(data)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setError('This share link is invalid or has been revoked.')
        } else {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!view) {
    return null
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{view.name}</Typography>
      <Typography color="text.secondary">
        Shared, read-only view — {view.bookmarks.length} bookmark
        {view.bookmarks.length === 1 ? '' : 's'}
      </Typography>

      {view.bookmarks.length === 0 ? (
        <Typography color="text.secondary">This collection is empty.</Typography>
      ) : (
        <List>
          {view.bookmarks.map((b) => (
            <ListItem key={b.id} divider>
              <ListItemText
                primary={
                  <MuiLink href={b.url} target="_blank" rel="noopener noreferrer">
                    {b.title}
                  </MuiLink>
                }
                secondary={b.notes ?? undefined}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  )
}
