import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_AUTH0_DOMAIN: z.string().min(1),
  VITE_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_AUTH0_AUDIENCE: z.string().optional(),
  VITE_AUTH0_CALLBACK_URL: z.string().url().optional(),
  // Permite desactivar Auth0 temporalmente ("true"/"false")
  VITE_AUTH_DISABLED: z.enum(['true', 'false']).optional(),
  // URL pública base para construir enlaces de presupuestos (p. ej. http://181.123.91.8:4000)
  VITE_PUBLIC_APP_URL: z.string().url().optional(),
  // URL base del servicio interno de archivos (S3 interno)
  VITE_FILES_BASE_URL: z.string().url().optional(),
})

export interface AppEnv {
  VITE_API_BASE_URL?: string
  VITE_AUTH0_DOMAIN: string
  VITE_AUTH0_CLIENT_ID: string
  VITE_AUTH0_AUDIENCE?: string
  VITE_AUTH0_CALLBACK_URL?: string
  VITE_AUTH_DISABLED?: 'true' | 'false'
  VITE_PUBLIC_APP_URL?: string
  VITE_FILES_BASE_URL?: string
}

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(import.meta.env)
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors
    console.error('[env] Variables inválidas en .env:', fields)
    throw new Error(
      '[env] Configuración inválida. Revisa tu .env: VITE_AUTH0_DOMAIN y VITE_AUTH0_CLIENT_ID son obligatorias, y VITE_AUTH0_CALLBACK_URL debe ser URL si se define.'
    )
  }
  return parsed.data
}
