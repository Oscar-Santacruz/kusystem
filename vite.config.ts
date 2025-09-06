import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  // base: '/ku-system', // descomentar si necesitas path base en despliegue
  server: {
    // Escuchar en todas las interfaces para permitir acceso externo
    host: true,
    port: 5175,
    strictPort: true,
    // Permitir conexiones locales y, si aplica, tu dominio público
    allowedHosts: ['localhost', '127.0.0.1', 'kusystem.ddns.net'],
    // HMR local estable (Firefox bloqueaba MIME/HMR con wss externo)
    hmr: {
      host: 'localhost',
      port: 5175,
      protocol: 'ws',
      clientPort: 5175,
    },
  },
})
