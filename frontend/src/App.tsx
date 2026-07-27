import { Route, Routes } from 'react-router-dom'
import { AppBar, Box, Button, Container, Toolbar } from '@mui/material'
import { Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Callback from './pages/Callback'
import Collections from './pages/Collections'
import LoginButton from './auth/LoginButton'
import LogoutButton from './auth/LogoutButton'
import RequireAuth from './auth/RequireAuth'
import { useAuth } from './auth/AuthProvider'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/about">
            About
          </Button>
          <Button color="inherit" component={Link} to="/collections">
            Collections
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {isAuthenticated ? <LogoutButton /> : <LoginButton />}
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/collections"
              element={
                <RequireAuth>
                  <Collections />
                </RequireAuth>
              }
            />
          </Routes>
        </Box>
      </Container>
    </>
  )
}

export default App
