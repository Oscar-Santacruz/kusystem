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
})

export interface AppEnv {
  VITE_API_BASE_URL?: string
  VITE_AUTH0_DOMAIN: string
  VITE_AUTH0_CLIENT_ID: string
  VITE_AUTH0_AUDIENCE?: string
  VITE_AUTH0_CALLBACK_URL?: string
  VITE_AUTH_DISABLED?: 'true' | 'false'
  VITE_PUBLIC_APP_URL?: string
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
  const env = parsed.data
  // Logs de diagnóstico (no exponen secretos)
  console.log('[env] cargado:', {
    VITE_AUTH0_DOMAIN: env.VITE_AUTH0_DOMAIN,
    VITE_AUTH0_CLIENT_ID: env.VITE_AUTH0_CLIENT_ID,
    VITE_AUTH0_AUDIENCE: env.VITE_AUTH0_AUDIENCE,
    VITE_AUTH0_CALLBACK_URL: env.VITE_AUTH0_CALLBACK_URL,
    VITE_API_BASE_URL: env.VITE_API_BASE_URL,
    VITE_AUTH_DISABLED: env.VITE_AUTH_DISABLED,
    VITE_PUBLIC_APP_URL: env.VITE_PUBLIC_APP_URL,
  })
  return env
}
