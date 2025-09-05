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
    port: 5173,
    strictPort: true,
    // Permitir conexiones desde el dominio
    allowedHosts: ['kusystem.ddns.net'],
    // Configurar HMR para que el cliente use el dominio público
    hmr: {
      host: 'kusystem.ddns.net',
      port: 443,
      protocol: 'wss',
      clientPort: 443
    },
  },
})
