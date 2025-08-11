import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

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
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, number>>(new Map())

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    const timerId = timers.current.get(id)
    if (timerId) {
      window.clearTimeout(timerId)
      timers.current.delete(id)
    }
  }, [])

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, durationMs: 3000, type: 'info', ...t }
    setToasts((list) => [...list, toast])
    const tid = window.setTimeout(() => remove(id), toast.durationMs)
    timers.current.set(id, tid)
  }, [remove])

  const success = useCallback((msg: string, opts?: Partial<Toast>) => show({ title: msg, type: 'success', ...opts }), [show])
  const error = useCallback((msg: string, opts?: Partial<Toast>) => show({ title: msg, type: 'error', ...opts }), [show])
  const info = useCallback((msg: string, opts?: Partial<Toast>) => show({ title: msg, type: 'info', ...opts }), [show])

  const value = useMemo(() => ({ show, success, error, info }), [show, success, error, info])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

function classNames(...list: Array<string | false | null | undefined>) {
  return list.filter(Boolean).join(' ')
}

export function Toaster({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={classNames(
            'pointer-events-auto rounded border px-3 py-2 shadow-sm',
            t.type === 'success' && 'border-emerald-300 bg-emerald-50 text-emerald-900',
            t.type === 'error' && 'border-red-300 bg-red-50 text-red-900',
            t.type === 'info' && 'border-slate-300 bg-white text-slate-900',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-medium">{t.title}</div>
              {t.description ? <div className="text-xs text-slate-600">{t.description}</div> : null}
            </div>
            <button
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => onClose(t.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
