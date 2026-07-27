import { Button } from '@mui/material'
import { useAuth } from './AuthProvider'

export default function LogoutButton() {
  const { logout } = useAuth()
  return (
    <Button color="inherit" onClick={logout}>
      Log out
    </Button>
  )
}
