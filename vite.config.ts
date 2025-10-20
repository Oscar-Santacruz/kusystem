import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = Number(env.VITE_PORT ?? 5175)
  const rawHost = env.VITE_HMR_HOST || 'localhost'
  const HMR_HOST = rawHost.replace(/^https?:\/\//, '')

  return {
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
      port: PORT,
      strictPort: true,
      // Permitir conexiones locales y, si aplica, tu dominio público
      allowedHosts: ['localhost', '127.0.0.1', 'kusystem.ddns.net'],
      // HMR local estable (Firefox bloqueaba MIME/HMR con wss externo)
      hmr: {
        host: HMR_HOST,
        port: PORT,
        protocol: 'ws',
        clientPort: PORT,
      },
    },
    build: {
      sourcemap: false,
      // Aumentar el umbral del warning sin desactivar optimizaciones
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar librerías base
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            // Librerías pesadas usadas para impresión/descarga
            pdf: ['html2pdf.js', 'html2pdf.js/dist/html2pdf.bundle.min.js'],
            qr: ['react-qr-code'],
          },
        },
      },
    },
  }
})
