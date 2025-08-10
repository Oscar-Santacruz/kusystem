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
})
