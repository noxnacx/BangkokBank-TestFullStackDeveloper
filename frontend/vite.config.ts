import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The registered Auth0 callback URL is fixed at http://localhost:3000/callback,
  // so this port isn't arbitrary -- it has to match what's on the Application's
  // Allowed Callback URLs list. The backend moved to 3001 to make room (see
  // backend/.env PORT).
  server: {
    port: 3000,
    // Fail loudly if 3000 is taken (e.g. a stale dev server still running)
    // instead of silently starting on 3001 -- that's the backend's port, and
    // a silent shift there previously made `curl localhost:3001` hit a
    // leftover Vite instance instead of the backend.
    strictPort: true,
  },
})
