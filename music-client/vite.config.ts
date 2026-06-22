import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: 'all',
    proxy: {
          '/api/media/stream': {
            target: 'http://bore.pub:4734',  // ← было localhost:8084
            changeOrigin: true,
          },
          '/api': {
            target: 'http://bore.pub:30767',  // ← было localhost:8080
            ws: true,
            changeOrigin: true,
          },
          '/auth': {
            target: 'http://bore.pub:30767',  // ← было localhost:8080
            changeOrigin: true,
          },
        },
//     proxy: {
//       '/api/media/stream': {
//         target: 'http://localhost:8084',
//         changeOrigin: true,
//       },
//       '/api': {
//         target: 'http://localhost:8080',
//         ws: true,
//         changeOrigin: true,
//       },
//       '/auth': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//       },
//     },
  },
})