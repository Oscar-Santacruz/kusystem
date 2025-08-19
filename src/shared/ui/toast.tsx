import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { Toaster as SonnerToaster, toast as sonner } from 'sonner'
import { useTheme } from '@/shared/ui/theme'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  durationMs?: number
}

interface ToastContextValue {
  show: (t: Omit<Toast, 'id'>) => void
  success: (msg: string, opts?: Partial<Toast>) => void
  error: (msg: string, opts?: Partial<Toast>) => void
  info: (msg: string, opts?: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const { title, description, type = 'info', durationMs } = t
    const opts = { description, duration: durationMs, closeButton: true } as const
    if (type === 'success') {
      sonner.success(title ?? '', opts)
    } else if (type === 'error') {
      sonner.error(title ?? '', opts)
    } else {
      sonner(title ?? '', opts)
    }
  }, [])

  const success = useCallback((msg: string, opts?: Partial<Toast>) => {
    sonner.success(msg, { description: opts?.description, duration: opts?.durationMs, closeButton: true })
  }, [])
  const error = useCallback((msg: string, opts?: Partial<Toast>) => {
    sonner.error(msg, { description: opts?.description, duration: opts?.durationMs, closeButton: true })
  }, [])
  const info = useCallback((msg: string, opts?: Partial<Toast>) => {
    sonner(msg, { description: opts?.description, duration: opts?.durationMs, closeButton: true })
  }, [])

  const value = useMemo(() => ({ show, success, error, info }), [show, success, error, info])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <SonnerToaster position="top-right" richColors closeButton theme={theme} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

// Sonner renderizado desde el Provider. No se exporta un Toaster propio.
