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
    // Configurar HMR para que el cliente use el puerto público
    // Si tu IP pública cambia o usas dominio, actualiza "host"
    hmr: {
      host: '181.123.91.8',
      port: 5173,
      clientPort: 5173,
    },
  },
})
