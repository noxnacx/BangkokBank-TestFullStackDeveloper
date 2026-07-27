import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useAuth } from '../auth/AuthProvider'
import { ApiError } from '../api/http'
import { listCollections, type Collection } from '../api/collections'
import {
  createBookmark,
  deleteBookmark,
  getBookmark,
  listBookmarks,
  type Bookmark,
} from '../api/bookmarks'

const ALL = 'all'
const UNCATEGORIZED = 'uncategorized'

export default function Bookmarks() {
  const { login } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>(ALL)

  const [formUrl, setFormUrl] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formCollectionId, setFormCollectionId] = useState('')
  const [creating, setCreating] = useState(false)

  const [detail, setDetail] = useState<Bookmark | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [toDelete, setToDelete] = useState<Bookmark | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleApiError = useCallback(
    (err: unknown, setMessage: (message: string) => void) => {
      if (err instanceof ApiError && err.status === 401) {
        void login()
        return
      }
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    },
    [login],
  )

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const [bookmarksData, collectionsData] = await Promise.all([
        listBookmarks(),
        listCollections(),
      ])
      setBookmarks(bookmarksData)
      setCollections(collectionsData)
    } catch (err) {
      handleApiError(err, setError)
    }
  }, [handleApiError])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const collectionNameById = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections],
  )

  const filteredBookmarks = useMemo(() => {
    if (!bookmarks) return null
    if (filter === ALL) return bookmarks
    if (filter === UNCATEGORIZED) return bookmarks.filter((b) => b.collectionId === null)
    return bookmarks.filter((b) => b.collectionId === filter)
  }, [bookmarks, filter])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const url = formUrl.trim()
    const title = formTitle.trim()
    if (!url || !title) return
    setCreating(true)
    try {
      await createBookmark({
        url,
        title,
        notes: formNotes.trim() || undefined,
        collectionId: formCollectionId || undefined,
      })
      setFormUrl('')
      setFormTitle('')
      setFormNotes('')
      setFormCollectionId('')
      await refresh()
    } catch (err) {
      handleApiError(err, setError)
    } finally {
      setCreating(false)
    }
  }

  async function openDetail(id: string) {
    setDetailError(null)
    try {
      setDetail(await getBookmark(id))
    } catch (err) {
      handleApiError(err, setDetailError)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteBookmark(toDelete.id)
      setToDelete(null)
      await refresh()
    } catch (err) {
      handleApiError(err, setError)
    } finally {
      setDeleting(false)
    }
  }

  function collectionLabel(collectionId: string | null) {
    if (collectionId === null) return 'Uncategorized'
    return collectionNameById.get(collectionId) ?? collectionId
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Bookmarks</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        component="form"
        onSubmit={(e: FormEvent) => void handleCreate(e)}
        sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
      >
        <TextField
          label="URL"
          size="small"
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          disabled={creating}
        />
        <TextField
          label="Title"
          size="small"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          disabled={creating}
        />
        <TextField
          label="Notes (optional)"
          size="small"
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
          disabled={creating}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="create-collection-label">Collection (optional)</InputLabel>
          <Select
            labelId="create-collection-label"
            label="Collection (optional)"
            value={formCollectionId}
            onChange={(e) => setFormCollectionId(e.target.value)}
            disabled={creating}
          >
            <MenuItem value="">None</MenuItem>
            {collections.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          disabled={creating || !formUrl.trim() || !formTitle.trim()}
        >
          Create
        </Button>
      </Box>

      <FormControl size="small" sx={{ maxWidth: 260 }}>
        <InputLabel id="filter-collection-label">Filter by collection</InputLabel>
        <Select
          labelId="filter-collection-label"
          label="Filter by collection"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value={ALL}>All</MenuItem>
          <MenuItem value={UNCATEGORIZED}>Uncategorized</MenuItem>
          {collections.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredBookmarks === null ? (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : filteredBookmarks.length === 0 ? (
        <Typography color="text.secondary">No bookmarks match this filter.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Collection</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookmarks.map((b) => (
                <TableRow
                  key={b.id}
                  hover
                  onClick={() => void openDetail(b.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{b.title}</TableCell>
                  <TableCell>{b.url}</TableCell>
                  <TableCell>{collectionLabel(b.collectionId)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        setToDelete(b)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={detail !== null || detailError !== null}
        onClose={() => {
          setDetail(null)
          setDetailError(null)
        }}
      >
        <DialogTitle>Bookmark details</DialogTitle>
        <DialogContent>
          {detailError ? (
            <Alert severity="error">{detailError}</Alert>
          ) : detail ? (
            <Stack spacing={1} sx={{ pt: 1 }}>
              <Typography>
                <strong>Title:</strong> {detail.title}
              </Typography>
              <Typography>
                <strong>URL:</strong> {detail.url}
              </Typography>
              <Typography>
                <strong>Notes:</strong> {detail.notes ?? '(none)'}
              </Typography>
              <Typography>
                <strong>Collection:</strong> {collectionLabel(detail.collectionId)}
              </Typography>
              <Typography>
                <strong>ID:</strong> {detail.id}
              </Typography>
              <Typography>
                <strong>Created:</strong> {new Date(detail.createdAt).toLocaleString()}
              </Typography>
              <Typography>
                <strong>Updated:</strong> {new Date(detail.updatedAt).toLocaleString()}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetail(null)
              setDetailError(null)
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toDelete !== null} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete bookmark?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete "{toDelete?.title}".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={() => void confirmDelete()} color="error" disabled={deleting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
