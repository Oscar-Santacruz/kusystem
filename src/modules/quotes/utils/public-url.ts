import { getEnv } from '@/config/env'
import type { Quote } from '@/modules/quotes/types'

// Construye la URL pública para visualizar un presupuesto
// Preferimos quote.publicId si existe; si no, usamos quote.id.
// Base URL:
// - Usa VITE_PUBLIC_APP_URL si está definida (recomendado para dev/prod)
// - Fallback: window.location.origin (sirve el frontend)
export function getPublicQuoteUrl(quote: Pick<Quote, 'id'> & Record<string, any>): string {
  const env = getEnv()
  const base = env.VITE_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const publicId: string = (quote as any)?.publicId || quote.id
  try {
    const url = new URL(`/q/${publicId}`, base)
    return url.toString()
  } catch {
    // Fallback crudo si base no es URL válida
    return `${base.replace(/\/$/, '')}/q/${publicId}`
  }
}
