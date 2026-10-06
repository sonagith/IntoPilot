import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // 'true' likhne se ngrok aur cloudflare dono ke URLs bina error ke open ho jayenge
    allowedHosts: true, 
  },
})