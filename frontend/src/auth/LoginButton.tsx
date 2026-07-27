import { Button } from '@mui/material'
import { useAuth } from './AuthProvider'

export default function LoginButton() {
  const { login } = useAuth()
  return (
    <Button color="inherit" onClick={() => void login()}>
      Log in
    </Button>
  )
}
