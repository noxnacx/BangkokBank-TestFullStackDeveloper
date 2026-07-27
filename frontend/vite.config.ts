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
  },
})
