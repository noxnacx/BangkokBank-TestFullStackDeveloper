import { useCallback, useEffect, useState, type FormEvent } from 'react'
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
  IconButton,
  Paper,
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
import {
  createCollection,
  createShareLink,
  deleteCollection,
  getCollection,
  listCollections,
  revokeShareLink,
  updateCollection,
  type Collection,
} from '../api/collections'

export default function Collections() {
  const { login } = useAuth()
  const [collections, setCollections] = useState<Collection[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const [detail, setDetail] = useState<Collection | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [toDelete, setToDelete] = useState<Collection | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false)
  const [revoking, setRevoking] = useState(false)

  // A 401 here means the token auth0-spa-js handed us was rejected by the
  // backend (expired between issue and use, revoked, etc.) -- the fix is
  // always the same, send the user through login again, so it's centralized
  // here rather than repeated in every catch block below.
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
      const data = await listCollections()
      setCollections(data)
    } catch (err) {
      handleApiError(err, setError)
    }
  }, [handleApiError])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      await createCollection(name)
      setNewName('')
      await refresh()
    } catch (err) {
      handleApiError(err, setError)
    } finally {
      setCreating(false)
    }
  }

  async function openDetail(id: string) {
    setDetailError(null)
    setIsEditing(false)
    setShareError(null)
    setCopied(false)
    setRevokeConfirmOpen(false)
    try {
      setDetail(await getCollection(id))
    } catch (err) {
      handleApiError(err, setDetailError)
    }
  }

  function shareLinkFor(shareToken: string) {
    return `${window.location.origin}/shared/${shareToken}`
  }

  async function handleShare() {
    if (!detail) return
    setSharing(true)
    setShareError(null)
    try {
      setDetail(await createShareLink(detail.id))
    } catch (err) {
      handleApiError(err, setShareError)
    } finally {
      setSharing(false)
    }
  }

  async function copyShareLink() {
    if (!detail?.shareToken) return
    await navigator.clipboard.writeText(shareLinkFor(detail.shareToken))
    setCopied(true)
  }

  async function confirmRevoke() {
    if (!detail) return
    setRevoking(true)
    setShareError(null)
    try {
      await revokeShareLink(detail.id)
      setDetail({ ...detail, shareToken: null })
      setRevokeConfirmOpen(false)
      setCopied(false)
    } catch (err) {
      handleApiError(err, setShareError)
    } finally {
      setRevoking(false)
    }
  }

  function startEdit() {
    if (!detail) return
    setEditName(detail.name)
    setSaveError(null)
    setIsEditing(true)
  }

  async function saveEdit() {
    if (!detail) return
    const name = editName.trim()
    if (!name) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateCollection(detail.id, name)
      setDetail(updated)
      setIsEditing(false)
      await refresh()
    } catch (err) {
      handleApiError(err, setSaveError)
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteCollection(toDelete.id)
      setToDelete(null)
      await refresh()
    } catch (err) {
      handleApiError(err, setError)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Collections</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={(e: FormEvent) => void handleCreate(e)} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          label="New collection name"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        <Button type="submit" variant="contained" disabled={creating || !newName.trim()}>
          Create
        </Button>
      </Box>

      {collections === null ? (
        <Stack sx={{ alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : collections.length === 0 ? (
        <Typography color="text.secondary">No collections yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {collections.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  onClick={() => void openDetail(c.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        setToDelete(c)
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
          setIsEditing(false)
        }}
      >
        <DialogTitle>{isEditing ? 'Edit collection' : 'Collection details'}</DialogTitle>
        <DialogContent>
          {detailError ? (
            <Alert severity="error">{detailError}</Alert>
          ) : detail && isEditing ? (
            <Stack spacing={2} sx={{ pt: 1, minWidth: 320 }}>
              {saveError && <Alert severity="error">{saveError}</Alert>}
              <TextField
                label="Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={saving}
                autoFocus
              />
            </Stack>
          ) : detail ? (
            <Stack spacing={1} sx={{ pt: 1 }}>
              <Typography>
                <strong>Name:</strong> {detail.name}
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

              {shareError && <Alert severity="error">{shareError}</Alert>}

              {detail.shareToken ? (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Anyone with this link can view this collection (read-only) —
                    no login required.
                  </Typography>
                  <TextField
                    value={shareLinkFor(detail.shareToken)}
                    size="small"
                    slotProps={{ input: { readOnly: true } }}
                    fullWidth
                  />
                  <Stack direction="row" spacing={1}>
                    <Button onClick={() => void copyShareLink()} size="small">
                      {copied ? 'Copied!' : 'Copy link'}
                    </Button>
                    <Button
                      onClick={() => setRevokeConfirmOpen(true)}
                      size="small"
                      color="error"
                    >
                      Revoke
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Button
                  onClick={() => void handleShare()}
                  disabled={sharing}
                  variant="outlined"
                  size="small"
                >
                  Share
                </Button>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {detail && isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={() => void saveEdit()}
                variant="contained"
                disabled={saving || !editName.trim()}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              {detail && <Button onClick={startEdit}>Edit</Button>}
              <Button
                onClick={() => {
                  setDetail(null)
                  setDetailError(null)
                }}
              >
                Close
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={revokeConfirmOpen} onClose={() => setRevokeConfirmOpen(false)}>
        <DialogTitle>Revoke share link?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Anyone using the current link will lose access immediately. You can
            create a new link later, but it will be a different URL.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeConfirmOpen(false)} disabled={revoking}>
            Cancel
          </Button>
          <Button onClick={() => void confirmRevoke()} color="error" disabled={revoking}>
            Revoke
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={toDelete !== null} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete collection?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete "{toDelete?.name}". Bookmarks in it become
            uncategorized, they are not deleted.
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
